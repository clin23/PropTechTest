"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listProperties } from "../lib/api";
import type { PropertySummary } from "../types/property";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: propertyList = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const links = [
    {
      href: "/",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18M6 8v13M16 13v8" />
        </svg>
      ),
    },
    {
      href: "/tasks",
      label: "Tasks",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m-7 8h8a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      href: "/properties",
      label: "Properties",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21h18M5 21V9m4 12V5m4 16V9m4 12V3"
          />
        </svg>
      ),
      children: propertyList.map((p) => ({
        href: `/properties/${p.id}`,
        label: p.address,
      })),
    },
  ];

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`relative h-screen bg-bg-base border-r border-[var(--border)] transition-all ${
        open ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <nav className="mt-12 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={`relative flex items-center px-4 py-2 rounded hover:bg-[var(--hover)] text-text-primary ${
                    open ? "" : "justify-center"
                  } ${active ? "bg-bg-elevated" : ""}`}
                >
                  {active && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-[var(--primary)]" />
                  )}
                  <span className="h-6 w-6">{link.icon}</span>
                  {open && <span className="ml-3">{link.label}</span>}
                </Link>
                {open && link.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-2 py-1 text-sm rounded hover:bg-[var(--hover)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)] flex justify-center">
          <Link
            href="/settings"
            className="p-2 rounded hover:bg-[var(--hover)]"
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.591 1.003 1.724 1.724 0 012.356.63 1.724 1.724 0 001.845 1.845 1.724 1.724 0 01.63 2.356 1.724 1.724 0 001.003 2.591c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.003 2.591 1.724 1.724 0 01-.63 2.356 1.724 1.724 0 00-2.356.63 1.724 1.724 0 01-2.591 1.003c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.591-1.003 1.724 1.724 0 01-2.356-.63 1.724 1.724 0 00-2.356-.63 1.724 1.724 0 01-1.003-2.591c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.003-2.591 1.724 1.724 0 01.63-2.356 1.724 1.724 0 00.63-2.356 1.724 1.724 0 011.003-2.591 1.724 1.724 0 012.591-1.003z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
