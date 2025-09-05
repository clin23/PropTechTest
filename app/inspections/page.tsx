"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getInspections, type Inspection } from "../../lib/api";
import InspectionCreateModal from "../../components/InspectionCreateModal";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";
import ErrorState from "../../components/ErrorState";

export default function InspectionsPage() {
  const queryClient = useQueryClient();
  const [property, setProperty] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
  } = useQuery<Inspection[]>({
    queryKey: ["inspections", { property, type, status }],
    queryFn: () => getInspections({ propertyId: property, type, status }),
  });

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Inspections">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={() => setOpen(true)}
        >
          New Inspection
        </button>
      </PageHeader>
      <div className="flex gap-2">
        <input
          placeholder="Property"
          className="border p-1"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
        />
        <select
          className="border p-1"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Entry">Entry</option>
          <option value="Routine">Routine</option>
          <option value="Exit">Exit</option>
        </select>
        <select
          className="border p-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <ErrorState message={(error as Error).message} />
      ) : (
        <ul className="space-y-2">
          {data?.map((insp: Inspection) => (
            <li key={insp.id} className="p-4 bg-white rounded border">
              <Link
                href={`/inspections/${insp.id}`}
                className="flex justify-between"
              >
                <span>Property {insp.propertyId}</span>
                <span className="text-sm text-gray-500">{insp.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <InspectionCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["inspections"] })}
      />
    </div>
  );
}

