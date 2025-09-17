"use client";

import Link from "next/link";
import type { PropertySummary } from "../../../../../types/property";
import { Button } from "../../../../../components/ui/button";

interface PropertyHeroProps {
  property: PropertySummary;
  onEdit: () => void;
}

export default function PropertyHero({ property, onEdit }: PropertyHeroProps) {
  const imageSrc = property.imageUrl || "/default-house.svg";

  return (
    <section className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
        <img
          src={imageSrc}
          alt={`Photo of ${property.address}`}
          className="h-full w-full object-cover"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={onEdit}
          className="absolute right-4 top-4 bg-white/90 text-sm font-medium text-gray-900 hover:bg-white"
        >
          Edit Property
        </Button>
      </div>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href={`/properties/${property.id}`}
            className="text-lg font-semibold text-blue-600 underline"
          >
            {property.address}
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Tenant: {property.tenant}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Rent / week
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            ${property.rent}/week
          </p>
        </div>
      </div>
    </section>
  );
}
