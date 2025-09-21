"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "next/navigation";

export function RouteProgress() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | undefined>();

  useEffect(() => {
    if (navigation.state !== "idle") {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      if (!loading) {
        setLoading(true);
      }
    } else if (loading) {
      timeoutRef.current = window.setTimeout(() => {
        setLoading(false);
        timeoutRef.current = undefined;
      }, 250);
    }

    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [navigation.state, loading]);

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
