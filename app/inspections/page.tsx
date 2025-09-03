"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInspections, createInspection } from "../../lib/api";

export default function InspectionsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["inspections"],
    queryFn: getInspections,
  });

  const create = useMutation({
    mutationFn: () =>
      createInspection({ propertyId: "1", type: "Entry", status: "Scheduled" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspections"] }),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inspections</h1>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={() => create.mutate()}
        >
          New Inspection
        </button>
      </div>
      <ul className="space-y-2">
        {data?.map((insp: any) => (
          <li
            key={insp.id}
            className="p-4 bg-white rounded border flex justify-between"
          >
            <span>Property {insp.propertyId}</span>
            <span className="text-sm text-gray-500">{insp.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
