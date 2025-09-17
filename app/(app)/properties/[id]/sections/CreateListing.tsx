"use client";

import ListingWizard from "../../../../../components/ListingWizard";
import type { PropertySummary } from "../../../../../types/property";

interface CreateListingProps {
  property: PropertySummary;
}

export default function CreateListing({ property }: CreateListingProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Create Listing for {property.address}
      </h2>
      <ListingWizard />
    </div>
  );
}
