"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApplicationsTable from "../../../../../components/ApplicationsTable";
import { listApplications, createApplication, getProperty } from "../../../../../lib/api";
import type { ApplicationRow } from "../../../../../types/application";

export default function PropertyApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: property } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
  });

  const { data: apps = [] } = useQuery<ApplicationRow[]>({
    queryKey: ["applications", id],
    queryFn: () => listApplications(id),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createApplication({
        propertyId: id,
        property: property?.address || "",
        applicant: "New Applicant",
        status: "New",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["applications", id] }),
  });

  if (!property) return <div className="p-6">Loading...</div>;
  if (property.tenant) return <div className="p-6">Property is occupied.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Applications</h1>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={() => mutation.mutate()}
        >
          Add Application
        </button>
      </div>
      <ApplicationsTable rows={apps} />
    </div>
  );
}
