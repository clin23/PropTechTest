"use client";

import Link from "next/link";
import type { PropertySummary } from "../types/property";

interface Props {
  property: PropertySummary;
}

export default function PropertyOverviewCard({ property }: Props) {
  return (
    <div className="border rounded overflow-hidden">
      <div className="bg-gray-200">
        <img
          src={property.imageUrl || "/default-house.svg"}
          alt="Property picture"
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              <Link
                href={`/properties/${property.id}`}
                className="text-blue-600 underline"
              >
                {property.address}
              </Link>
            </h2>
            <p>Tenant: {property.tenant}</p>
            <p>
              Lease: {property.leaseStart} – {property.leaseEnd}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">${property.rent}/week</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Upcoming</h3>
          <ul className="list-disc pl-5">
            {property.events.map((e) => (
              <li key={e.date + e.title}>
                {e.date}: {e.title}
              </li>
            ))}
            {property.events.length === 0 && <li>None</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

