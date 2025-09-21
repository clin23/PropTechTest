"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useRouteTransition } from "./RouteProgress";
import { getRouteSkeleton } from "./skeletons";

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
  className?: string;
}

export default function PageTransition({ children, routeKey, className }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();
  const { isNavigating, targetPath } = useRouteTransition();
  const skeleton = getRouteSkeleton(targetPath ?? routeKey);

  const animationProps = reduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.16, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.1, ease: "easeIn" } },
      };

  const skeletonMotion = reduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.12, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.12, ease: "easeIn" } },
      };

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        <motion.div key={routeKey} {...animationProps} className={className}>
          {children}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {isNavigating && skeleton ? (
          <motion.div
            key="route-skeleton"
            {...skeletonMotion}
            className="pointer-events-none absolute inset-0 z-40 overflow-hidden bg-white/90 backdrop-blur-sm dark:bg-gray-950/70"
          >
            <div className="pointer-events-none overflow-y-auto">{skeleton}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
