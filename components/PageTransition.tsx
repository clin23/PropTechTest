"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
  className?: string;
}

export default function PageTransition({ children, routeKey, className }: PageTransitionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const scrollContainer = node.closest<HTMLElement>("[data-scroll-container]");
    if (!scrollContainer) {
      return;
    }

    if (scrollContainer.scrollTop !== 0 || scrollContainer.scrollLeft !== 0) {
      if (typeof scrollContainer.scrollTo === "function") {
        scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } else {
        scrollContainer.scrollTop = 0;
        scrollContainer.scrollLeft = 0;
      }
    }
  }, [routeKey]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
