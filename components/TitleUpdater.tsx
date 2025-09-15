"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/analytics/overview": "Analytics Overview",
  "/analytics/custom": "My Custom Analytics",
  "/analytics/builder": "Analytics Builder",
  "/tasks": "Tasks",
  "/tasks/archive": "Tasks Archive",
  "/properties": "Properties",
  "/documents": "Documents",
  "/reminders": "Reminders",
  "/settings": "Settings",
  "/settings/notifications": "Notification Settings",
  "/finance/pnl": "Profit & Loss",
  "/finance/expenses": "Expenses",
  "/finance/scan": "Scan Receipt",
};

export default function TitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    let title = "PropTech";

    if (pathname) {
      if (titleMap[pathname]) {
        title = `PropTech | ${titleMap[pathname]}`;
      } else if (pathname.startsWith("/properties/")) {
        const parts = pathname.split("/");
        if (parts.length === 3) {
          title = "PropTech | Property";
        } else {
          const sub = parts[3];
          const propertyMap: Record<string, string> = {
            applications: "Applications",
            listing: "Listing",
            edit: "Edit Property",
            inspections: "Inspections",
          };
          title = `PropTech | ${propertyMap[sub] ?? "Property"}`;
        }
      }
    }

    document.title = title;
  }, [pathname]);

  return null;
}
