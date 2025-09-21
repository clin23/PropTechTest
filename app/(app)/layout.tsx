"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import PageTransition from "../../components/PageTransition";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routeKey = pathname ?? "/";

  return <PageTransition routeKey={routeKey}>{children}</PageTransition>;
}
