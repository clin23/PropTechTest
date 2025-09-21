"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout>>();
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return undefined;
    }

    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    setLoading(true);

    timeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      timeoutRef.current = undefined;
    }, 250);

    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [pathname, searchParamsKey]);

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
