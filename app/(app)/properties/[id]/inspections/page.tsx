"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInspections, createInspection, type Inspection } from "../../../../../lib/api";

export default function PropertyInspectionsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<Inspection[]>({
    queryKey: ["inspections", id],
    queryFn: () => getInspections({ propertyId: id }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createInspection({
        propertyId: id,
        type: "Routine",
        status: "Scheduled",
        date: new Date().toISOString(),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inspections", id] }),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Inspections</h1>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={() => mutation.mutate()}
        >
          Start Inspection
        </button>
      </div>
      <ul className="space-y-2">
        {data.map((insp) => (
          <li key={insp.id} className="p-4 bg-white border rounded">
            <div className="flex justify-between">
              <span>{insp.type}</span>
              <span className="text-sm text-gray-500">{insp.status}</span>
            </div>
          </li>
        ))}
        {data.length === 0 && <li>No inspections</li>}
      </ul>
    </div>
  );
}
