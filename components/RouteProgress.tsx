"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { normalizePath } from "./skeletons";

interface RouteTransitionContextValue {
  isNavigating: boolean;
  targetPath: string | null;
}

const RouteTransitionContext = createContext<RouteTransitionContextValue>({
  isNavigating: false,
  targetPath: null,
});

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}

export function RouteTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const manager = useRouteTransitionManager();

  return (
    <RouteTransitionContext.Provider
      value={{
        isNavigating: manager.loading,
        targetPath: manager.targetPath,
      }}
    >
      {children}
      <RouteProgressBar loading={manager.loading} />
    </RouteTransitionContext.Provider>
  );
}

function RouteProgressBar({ loading }: { loading: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent"
    >
      <div className={`h-full ${loading ? "w-full" : "w-0"} bg-black/60`} />
    </div>
  );
}

function resolveTargetPath(url: Parameters<History["pushState"]>[2]): string | null {
  if (!url) {
    return null;
  }

  if (typeof url === "string") {
    try {
      const parsed = new URL(
        url,
        typeof window === "undefined" ? "http://localhost" : window.location.href
      );
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return url.startsWith("/") ? url : `/${url}`;
    }
  }

  try {
    const parsed = new URL(url.toString(), window.location.href);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function useRouteTransitionManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = useMemo(
    () => searchParams?.toString() ?? "",
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const isMountedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current !== undefined) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  }, []);

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current !== undefined) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = undefined;
    }
  }, []);

  const startLoading = useCallback(
    (nextPath?: string | null) => {
      if (!isMountedRef.current) {
        return;
      }

      clearHideTimeout();
      clearFallbackTimeout();

      const resolvedPath = nextPath ? resolveTargetPath(nextPath) : null;

      if (resolvedPath && typeof window !== "undefined") {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const normalizedCurrent = normalizePath(currentPath);
        const normalizedNext = normalizePath(resolvedPath);

        if (normalizedCurrent === normalizedNext) {
          setLoading(false);
          setTargetPath(null);
          return;
        }
      }

      if (resolvedPath) {
        setTargetPath(resolvedPath);
      } else {
        setTargetPath(null);
      }

      setLoading(true);

      fallbackTimeoutRef.current = window.setTimeout(() => {
        setLoading(false);
        setTargetPath(null);
        fallbackTimeoutRef.current = undefined;
      }, 10000);
    },
    [clearFallbackTimeout, clearHideTimeout]
  );

  const finishLoading = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    clearFallbackTimeout();
    clearHideTimeout();

    hideTimeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      setTargetPath(null);
      hideTimeoutRef.current = undefined;
    }, 250);
  }, [clearFallbackTimeout, clearHideTimeout]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearHideTimeout();
      clearFallbackTimeout();
    };
  }, [clearFallbackTimeout, clearHideTimeout]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }

    finishLoading();
  }, [finishLoading, pathname, searchParamsKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { history } = window;

    const wrap =
      <Fn extends History["pushState"] | History["replaceState"]>(fn: Fn) =>
      function wrapped(this: History, ...args: Parameters<Fn>) {
        const nextPath = resolveTargetPath(args[2]);
        startLoading(nextPath);

        try {
          return fn.apply(this, args as Parameters<Fn>);
        } catch (error) {
          finishLoading();
          throw error;
        }
      } as Fn;

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = wrap(originalPushState);
    history.replaceState = wrap(originalReplaceState);

    const handlePopState = () => {
      const next = `${window.location.pathname}${window.location.search}`;
      startLoading(next);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [finishLoading, startLoading]);

  return { loading, targetPath };
}
