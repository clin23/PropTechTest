"use client";

import type { ReactNode } from "react";

export function SharedTile({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {children}
    </div>
  );
}
