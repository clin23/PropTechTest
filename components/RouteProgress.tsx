"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const path = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(id);
  }, [path]);

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
