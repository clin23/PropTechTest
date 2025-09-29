"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { PropertySummary } from "../../../../../types/property";
import { Button } from "../../../../../components/ui/button";
import { type PropertyTabId } from "../tabs";
import { sortPropertyEvents } from "../lib/sortEvents";
import ActionButtons from "./ActionButtons";
import NextKeyDates from "./NextKeyDates";

interface PropertyHeroProps {
  property: PropertySummary;
  onEdit: () => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onUploadDocument: () => void;
  onNavigateToTab: (tabId: PropertyTabId) => void;
}

const rentFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatRent(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const amount = rentFormatter.format(value);
  return `$${amount}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return dateFormatter.format(parsed);
}

export default function PropertyHero({
  property,
  onEdit,
  onAddIncome,
  onAddExpense,
  onUploadDocument,
  onNavigateToTab,
}: PropertyHeroProps) {
  const imageSrc = property.imageUrl || "/default-house.svg";
  const sortedEvents = sortPropertyEvents(property.events);
  const nextEvent = sortedEvents[0];

  const rentDisplay = formatRent(property.rent);

  const summaryItems: Array<{
    label: string;
    value: string;
    tabId: PropertyTabId;
  }> = [
    { label: "Tenant", value: property.tenant || "—", tabId: "tenant-crm" },
    {
      label: "Rent / week",
      value: rentDisplay === "—" ? rentDisplay : `${rentDisplay}/week`,
      tabId: "rent-ledger",
    },
    { label: "Lease start", value: formatDate(property.leaseStart), tabId: "documents" },
    { label: "Lease end", value: formatDate(property.leaseEnd), tabId: "documents" },
  ];

  if (nextEvent) {
    const nextEventDate = formatDate(nextEvent.date);
    summaryItems.push({
      label: "Next key date",
      value:
        nextEventDate === "—"
          ? nextEvent.title
          : `${nextEventDate} · ${nextEvent.title}`,
      tabId: "key-dates",
    });
  }

  const handleSummaryActivate = (tabId: PropertyTabId) => {
    onNavigateToTab(tabId);
  };

  const handleSummaryKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    tabId: PropertyTabId,
  ) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      handleSummaryActivate(tabId);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-[4/3] w-full bg-gray-200 dark:bg-gray-700">
        <img
          src={imageSrc}
          alt={`Photo of ${property.address}`}
          className="h-full w-full object-cover"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={onEdit}
          className="absolute right-4 top-4 bg-white/90 text-sm font-semibold text-gray-900 hover:bg-white"
        >
          Edit Property
        </Button>
      </div>
      <div className="space-y-6 p-6">
        <div>
          <Link
            href={`/properties/${property.id}`}
            className="text-xl font-semibold text-blue-600 underline-offset-2 hover:text-blue-700"
          >
            {property.address}
          </Link>
        </div>
        <dl className="grid grid-cols-1 gap-4 text-sm text-gray-700 dark:text-gray-200 sm:grid-cols-2">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              role="button"
              tabIndex={0}
              onClick={() => handleSummaryActivate(item.tabId)}
              onKeyDown={(event) => handleSummaryKeyDown(event, item.tabId)}
              className="space-y-1 rounded-md border border-transparent p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/70 dark:focus-visible:ring-offset-gray-900"
              aria-label={`View ${item.label} details`}
            >
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {item.label}
              </dt>
              <dd className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <NextKeyDates events={sortedEvents} onNavigate={onNavigateToTab} />
      </div>
      <div className="border-t bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/60">
        <ActionButtons
          onAddIncome={onAddIncome}
          onAddExpense={onAddExpense}
          onUploadDocument={onUploadDocument}
        />
      </div>
    </section>
  );
}
