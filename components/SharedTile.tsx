"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function SharedTile({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layoutId={reduceMotion ? undefined : "summary"}
      className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      {children}
    </motion.div>
  );
}
