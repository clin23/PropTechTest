"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RouterInstance = ReturnType<typeof useRouter>;
type MutableRouterInstance = {
  -readonly [Key in keyof RouterInstance]: RouterInstance[Key];
};

export function RouteProgress() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = useMemo(
    () => searchParams?.toString() ?? "",
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
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

  const startLoading = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    clearHideTimeout();
    clearFallbackTimeout();

    setLoading(true);

    fallbackTimeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      fallbackTimeoutRef.current = undefined;
    }, 10000);
  }, [clearFallbackTimeout, clearHideTimeout]);

  const finishLoading = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    clearFallbackTimeout();
    clearHideTimeout();

    hideTimeoutRef.current = window.setTimeout(() => {
      setLoading(false);
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

    const mutableRouter = router as MutableRouterInstance;

    const wrap =
      <Fn extends (...args: unknown[]) => unknown>(fn: Fn) =>
      ((...args: Parameters<Fn>) => {
        startLoading();

        try {
          const result = fn.apply(mutableRouter, args as Parameters<Fn>);

          if (
            result &&
            typeof result === "object" &&
            "catch" in result &&
            typeof (result as Promise<unknown>).catch === "function"
          ) {
            (result as Promise<unknown>).catch(() => {
              finishLoading();
            });
          }

          return result;
        } catch (error) {
          finishLoading();
          throw error;
        }
      }) as Fn;

    const originalPush = mutableRouter.push;
    const originalReplace = mutableRouter.replace;

    mutableRouter.push = wrap(originalPush);
    mutableRouter.replace = wrap(originalReplace);

    const handlePopState = () => {
      startLoading();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      mutableRouter.push = originalPush;
      mutableRouter.replace = originalReplace;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [finishLoading, router, startLoading]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent"
    >
      <div
        className={`h-full ${loading ? "w-full" : "w-0"} bg-black/60 transition-[width] duration-200`}
      />
    </div>
  );
}
