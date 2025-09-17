"use client";

import Link from "next/link";
import type { PropertySummary } from "../../../../../types/property";
import { Button } from "../../../../../components/ui/button";

interface PropertyHeroProps {
  property: PropertySummary;
  onEdit: () => void;
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

export default function PropertyHero({ property, onEdit }: PropertyHeroProps) {
  const imageSrc = property.imageUrl || "/default-house.svg";
  const nextEvent = property.events?.[0];

  const rentDisplay = formatRent(property.rent);

  const summaryItems = [
    { label: "Tenant", value: property.tenant || "—" },
    {
      label: "Rent / week",
      value: rentDisplay === "—" ? rentDisplay : `${rentDisplay}/week`,
    },
    { label: "Lease start", value: formatDate(property.leaseStart) },
    { label: "Lease end", value: formatDate(property.leaseEnd) },
  ];

  if (nextEvent) {
    const nextEventDate = formatDate(nextEvent.date);
    summaryItems.push({
      label: "Next key date",
      value:
        nextEventDate === "—"
          ? nextEvent.title
          : `${nextEventDate} · ${nextEvent.title}`,
    });
  }

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
            <div key={item.label} className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {item.label}
              </dt>
              <dd className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
