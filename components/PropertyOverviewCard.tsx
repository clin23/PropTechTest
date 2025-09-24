"use client";

import Link from "next/link";
import type { PropertySummary } from "../types/property";

interface Props {
  property: PropertySummary;
}

export default function PropertyOverviewCard({ property }: Props) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="grid h-64 grid-rows-[65%_35%] overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-950"
    >
      <img
        src={property.imageUrl || "/default-house.svg"}
        alt={`Photo of ${property.address}`}
        className="h-full w-full object-cover"
      />
      <div className="flex flex-col gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-900">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
            {property.address}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Tenant: {property.tenant}</p>
        </div>
        <p className="text-right text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
          ${property.rent}/week
        </p>
      </div>
    </Link>
  );
}

