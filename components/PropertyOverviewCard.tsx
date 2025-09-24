"use client";

import type { PropertySummary } from "../types/property";

interface Props {
  property: PropertySummary;
}

export default function PropertyOverviewCard({ property }: Props) {
  return (
    <div className="grid h-64 grid-rows-[65%_35%] overflow-hidden rounded border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <img
        src={property.imageUrl || "/default-house.svg"}
        alt={`Photo of ${property.address}`}
        className="h-full w-full object-cover"
      />
      <div className="flex flex-col justify-between gap-3 bg-slate-50 p-4 dark:bg-slate-900">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {property.address}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Tenant: {property.tenant}</p>
        </div>
        <p className="text-right text-lg font-semibold text-slate-900 dark:text-slate-100">
          ${property.rent}/week
        </p>
      </div>
    </div>
  );
}

