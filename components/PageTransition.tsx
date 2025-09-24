"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
  className?: string;
}

function getTopLevelSegment(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const segments = path.split("/").filter(Boolean);
  return segments[0] ?? "/";
}

export default function PageTransition({ children, routeKey, className }: PageTransitionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const transitionKey = useMemo(() => getTopLevelSegment(routeKey), [routeKey]);

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
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={transitionKey}
        ref={rootRef}
        className={className}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
