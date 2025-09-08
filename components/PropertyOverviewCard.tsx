"use client";

import Link from "next/link";
import type { PropertySummary } from "../types/property";

interface Props {
  property: PropertySummary;
}

export default function PropertyOverviewCard({ property }: Props) {
  return (
    <div className="border rounded overflow-hidden h-64 grid grid-rows-2">
      <img
        src={property.imageUrl || "/default-house.svg"}
        alt={`Photo of ${property.address}`}
        className="w-full h-full object-cover"
      />
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <Link
              href={`/properties/${property.id}`}
              className="text-blue-600 underline"
            >
              {property.address}
            </Link>
          </h2>
          <p>Tenant: {property.tenant}</p>
        </div>
        <p className="text-right font-semibold">${property.rent}/week</p>
      </div>
    </div>
  );
}

