"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
  className?: string;
}

export default function PageTransition({ children, routeKey, className }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();

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

  return (
    <AnimatePresence mode="wait">
      <motion.div key={routeKey} {...animationProps} className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
