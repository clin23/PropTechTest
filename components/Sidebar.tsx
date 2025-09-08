"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Sidebar() {
  // `open` tracks whether the sidebar is expanded or collapsed
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setOpen(true);
    }
  }, []);

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
      children: [
        { href: "/properties/123-main-st", label: "123 Main St" },
        { href: "/properties/456-oak-ave", label: "456 Oak Ave" },
      ],
    },
    {
      href: "/rent-review",
      label: "Rent Review",
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
            d="M9 2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4a2 2 0 012-2zm0 4h6m-6 4h6m-6 4h6"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`relative h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all ${
        open ? "w-64" : "w-16"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-2 right-2 p-1 rounded bg-blue-600 text-white"
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </button>
      <div className="flex flex-col h-full justify-between">
        <nav className="mt-12 space-y-1">
            {links.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    open ? "" : "justify-center"
                  }`}
                >
                  <span className="h-6 w-6">{link.icon}</span>
                  {open && <span className="ml-3">{link.label}</span>}
                </Link>
                {open && link.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t dark:border-gray-700 flex justify-center">
            <Link
              href="/settings"
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
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
    </div>
  );
}
