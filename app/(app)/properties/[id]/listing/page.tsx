"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ListingWizard from "../../../../../components/ListingWizard";
import { getProperty } from "../../../../../lib/api";

export default function PropertyListingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">
        Create Listing{property ? ` for ${property.address}` : ""}
      </h1>
      <ListingWizard />
    </div>
  );
}
