"use client";

import Link from "next/link";
import type { PropertySummary } from "../types/property";

interface Props {
  property: PropertySummary;
}

export default function PropertyOverviewCard({ property }: Props) {
  const detailPath = `/properties/${property.id}`;

  return (
    <Link
      href={detailPath}
      aria-label={`View details for ${property.address}`}
      className="group flex h-64 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-950"
    >
      <div className="relative shrink-0 basis-[65%] overflow-hidden">
        <img
          src={property.imageUrl || "/default-house.svg"}
          alt={`Photo of ${property.address}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex shrink-0 basis-[35%] flex-col justify-between gap-2 bg-slate-50/95 px-4 pb-4 pt-3 text-slate-900 dark:bg-slate-800/90 dark:text-slate-100">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 dark:text-white">
            {property.address}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Tenant: {property.tenant}</p>
        </div>
        <p className="text-right text-lg font-semibold text-indigo-600 dark:text-indigo-300">
          ${property.rent}/week
        </p>
      </div>
    </Link>
  );
}

