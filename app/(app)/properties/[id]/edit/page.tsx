"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PropertyForm from "../../../../../components/PropertyForm";
import { getProperty } from "../../../../../lib/api";
import type { PropertySummary } from "../../../../../types/property";

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = useQuery<PropertySummary>({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
  });
  if (!property) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Edit Property</h1>
      <PropertyForm property={property} />
    </div>
  );
}

