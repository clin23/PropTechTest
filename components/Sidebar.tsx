"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inspections", label: "Inspections" },
  { href: "/applications", label: "Applications" },
  { href: "/listings", label: "Listings" },
  { href: "/rent-review", label: "Rent Review" },
  { href: "/finance", label: "Finance" },
  { href: "/vendors", label: "Vendors" },
  { href: "/settings", label: "Settings" }
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="m-2 md:hidden" onClick={() => setOpen(true)}>
        Menu
      </Button>
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 space-y-2">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 rounded hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
