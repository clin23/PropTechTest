"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listProperties, getProperty, fetchTenants, getTenant } from "../lib/api";
import type { PropertySummary } from "../types/property";
import { usePathname, useRouter } from "next/navigation";
import {
  getRecentPropertyIds,
  getRecentTenantIds,
  RECENT_ITEMS_EVENT,
  RECENT_PROPERTY_STORAGE_KEY,
  RECENT_TENANT_STORAGE_KEY,
  type RecentItemsEventDetail,
} from "../lib/recentItems";

const iconProps = {
  className: "h-6 w-6",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function DashboardIcon() {
  return (
    <svg {...iconProps}>
      <rect x={3.75} y={4.25} width={16.5} height={15.5} rx={2.5} />
      <path d="M10 4.25v15.5" />
      <path d="M3.75 10.5h16.5" />
      <path d="M13.75 13.5l1.75 1.75L19 12.25" />
      <path d="M13.25 16.75h5" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 19.25h16" />
      <path d="M6.25 15.5l4.25-5.5 3.5 3.75 4.75-6.5" />
      <circle cx={6.25} cy={15.5} r={0.9} />
      <circle cx={10.5} cy={10} r={0.9} />
      <circle cx={14} cy={13.5} r={0.9} />
      <circle cx={18.75} cy={7.75} r={0.9} />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8.5 4.25h7" />
      <path d="M9.25 3.5h5.5" />
      <rect x={5.25} y={5.5} width={13.5} height={14} rx={2.5} />
      <path d="M9 11.75l2.25 2.25 3.75-4.75" />
      <path d="M9 16.75h6.5" />
    </svg>
  );
}

function PropertiesIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4.75 18.75V10.5L12 4.25l7.25 6.25v8.25" />
      <path d="M7.5 18.75h9" />
      <path d="M9.75 18.75v-4.5h4.5v4.5" />
      <path d="M8.25 12.5h1.5" />
      <path d="M14.25 12.5h1.5" />
    </svg>
  );
}

function TenantsIcon() {
  return (
    <svg {...iconProps}>
      <circle cx={12} cy={9} r={3} />
      <path d="M6.75 9.75a2.25 2.25 0 114.5 0" />
      <path d="M12 13.5c3.25 0 5.75 2.25 5.75 5" />
      <path d="M6.25 18.5c0-2.3 1.6-4.2 3.9-4.8" />
      <path d="M5.5 9.5a2 2 0 113.5-1.5" />
      <path d="M18.5 9.5a2 2 0 10-3.5-1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 15.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z" />
      <path d="M5.75 9.25l-1 .75" />
      <path d="M5 14l-1 .5" />
      <path d="M9.25 18.25L8.75 19.5" />
      <path d="M14.75 18.25l.5 1.25" />
      <path d="M19 14l1 .5" />
      <path d="M18.25 9.25l1-.75" />
      <path d="M14.75 5.75l.5-1.25" />
      <path d="M9.25 5.75L8.75 4.5" />
      <path d="M12 4.25v-1.5" />
      <path d="M12 21.25v-1.5" />
    </svg>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recentPropertyIds, setRecentPropertyIds] = useState<string[]>([]);
  const [recentTenantIds, setRecentTenantIds] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: propertyList = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const { data: tenantDirectory } = useQuery({
    queryKey: ["tenant-nav"],
    queryFn: () => fetchTenants({ pageSize: 25 }),
  });

  useEffect(() => {
    const updateProperties = () => setRecentPropertyIds(getRecentPropertyIds());
    const updateTenants = () => setRecentTenantIds(getRecentTenantIds());

    updateProperties();
    updateTenants();

    const handleRecentUpdate = (event: CustomEvent<RecentItemsEventDetail>) => {
      const detail = event.detail;
      if (detail.type === "property") {
        setRecentPropertyIds(detail.ids);
      }
      if (detail.type === "tenant") {
        setRecentTenantIds(detail.ids);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === RECENT_PROPERTY_STORAGE_KEY) {
        updateProperties();
      }
      if (event.key === RECENT_TENANT_STORAGE_KEY) {
        updateTenants();
      }
    };

    window.addEventListener(RECENT_ITEMS_EVENT, handleRecentUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(RECENT_ITEMS_EVENT, handleRecentUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const tenantList = useMemo(
    () => (tenantDirectory?.items ?? []).filter((tenant) => tenant.currentPropertyId),
    [tenantDirectory]
  );

  const visibleProperties = useMemo(() => {
    const recentMatches = recentPropertyIds
      .map((id) => propertyList.find((property) => property.id === id))
      .filter((property): property is PropertySummary => Boolean(property));
    const remaining = propertyList.filter((property) => !recentPropertyIds.includes(property.id));
    return [...recentMatches, ...remaining].slice(0, 4);
  }, [propertyList, recentPropertyIds]);

  const visibleTenants = useMemo(() => {
    const recentMatches = recentTenantIds
      .map((id) => tenantList.find((tenant) => tenant.id === id))
      .filter((tenant): tenant is (typeof tenantList)[number] => Boolean(tenant));
    const remaining = tenantList.filter((tenant) => !recentTenantIds.includes(tenant.id));
    return [...recentMatches, ...remaining].slice(0, 4);
  }, [tenantList, recentTenantIds]);

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: <AnalyticsIcon />,
    },
    {
      href: "/tasks",
      label: "Tasks",
      icon: <TasksIcon />,
    },
    {
      href: "/properties",
      label: "Properties",
      icon: <PropertiesIcon />,
      children: visibleProperties.map((p) => ({
        href: `/properties/${p.id}`,
        label: p.address,
        prefetch: () =>
          queryClient.prefetchQuery({
            queryKey: ["property", p.id],
            queryFn: () => getProperty(p.id),
          }),
      })),
    },
    {
      href: "/tenants",
      label: "Tenants",
      icon: <TenantsIcon />,
      children: visibleTenants.map((tenant) => ({
        href: `/tenants/${tenant.id}`,
        label: tenant.fullName,
        prefetch: () =>
          queryClient.prefetchQuery({
            queryKey: ["tenant", tenant.id],
            queryFn: () => getTenant(tenant.id),
          }),
      })),
    },
  ];

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      handleMouseLeave();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleBlur}
      className={`relative h-screen bg-bg-base border-r border-[var(--border)] overflow-hidden transition-[width] duration-300 ease-in-out ${
        open ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <nav className="mt-12 space-y-1">
          {links.map((link) => {
            const childLinks = Array.isArray(link.children) ? link.children : [];
            const childActive = childLinks.some(
              (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
            );
            const active =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`) ||
              childActive;
            return (
              <div key={link.href}>
                <Link
                  href={link.href}
                  prefetch
                  onMouseEnter={() => {
                    handleMouseEnter();
                    router.prefetch(link.href);
                  }}
                  className={`relative flex items-center px-4 py-2 rounded hover:bg-[var(--hover)] text-text-primary ${
                    open ? "" : "justify-center"
                  } ${
                    active
                      ? "bg-[rgba(37,99,235,.08)] border-l-2 border-[var(--primary)]"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <span className="h-6 w-6 flex-shrink-0">{link.icon}</span>
                  <span
                    aria-hidden={!open}
                    className={`inline-flex items-center whitespace-nowrap overflow-hidden text-sm transition-[margin,max-width,opacity] duration-300 ease-in-out ${
                      open
                        ? "ml-3 max-w-[14rem] opacity-100"
                        : "ml-0 max-w-0 opacity-0"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
                {open && childLinks.length > 0 && (
                  <div className="ml-8 mt-1 space-y-1">
                    {childLinks.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        prefetch
                        onMouseEnter={() => {
                          handleMouseEnter();
                          router.prefetch(child.href);
                          child.prefetch?.();
                        }}
                        className={`block px-2 py-1 text-sm rounded hover:bg-[var(--hover)] ${
                          pathname === child.href || pathname.startsWith(`${child.href}/`)
                            ? "bg-[rgba(37,99,235,.08)] text-[var(--primary)]"
                            : ""
                        }`}
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
            onMouseEnter={handleMouseEnter}
            aria-label="Settings"
          >
            <SettingsIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
