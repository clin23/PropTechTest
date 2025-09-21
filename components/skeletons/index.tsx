import type { ReactNode } from "react";

import AnalyticsSkeleton from "./AnalyticsSkeleton";
import PropertiesGridSkeleton from "./PropertiesGridSkeleton";
import PropertyPageSkeleton from "./PropertyPageSkeleton";
import TasksSkeleton from "./TasksSkeleton";

function normalizePath(path: string): string {
  try {
    const url = new URL(path, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    return url.pathname;
  } catch {
    const cleaned = path.split(/[?#]/)[0] ?? path;
    return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  }
}

export function getRouteSkeleton(path: string | null | undefined): ReactNode | null {
  if (!path) {
    return null;
  }

  const pathname = normalizePath(path);

  if (pathname.startsWith("/analytics")) {
    return <AnalyticsSkeleton />;
  }

  if (pathname.startsWith("/tasks")) {
    return <TasksSkeleton />;
  }

  if (pathname === "/properties") {
    return <PropertiesGridSkeleton />;
  }

  if (pathname.startsWith("/properties/")) {
    return <PropertyPageSkeleton />;
  }

  return null;
}
