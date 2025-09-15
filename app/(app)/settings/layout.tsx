import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import DarkModeToggle from "../../../components/DarkModeToggle";
import React from "react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <aside className="w-64 border-r p-6 space-y-4">
        <PageHeader title="Settings" />
        <label className="flex items-center justify-between">
          <span className="sr-only">Dark Mode</span>
          <DarkModeToggle />
        </label>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <Link href="/settings/notifications">Notification Preferences</Link>
          </li>
        </ul>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
