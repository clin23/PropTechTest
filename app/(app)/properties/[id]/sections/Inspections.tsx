"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../../../components/ui/button";
import { createInspection, getInspections, type Inspection } from "../../../../../lib/api";
import { useScrollLockOnHover } from "../../../../../hooks/useScrollLockOnHover";

interface InspectionsProps {
  propertyId: string;
}

export default function Inspections({ propertyId }: InspectionsProps) {
  const queryClient = useQueryClient();
  const { data = [], isPending } = useQuery<Inspection[]>({
    queryKey: ["inspections", propertyId],
    queryFn: () => getInspections({ propertyId }),
  });

  const createInspectionMutation = useMutation({
    mutationFn: () =>
      createInspection({
        propertyId,
        type: "Routine",
        status: "Scheduled",
        date: new Date().toISOString(),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inspections", propertyId] }),
  });

  const scrollRef = useScrollLockOnHover<HTMLDivElement>();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Inspections</h2>
        <Button
          type="button"
          onClick={() => createInspectionMutation.mutate()}
          disabled={createInspectionMutation.isPending}
        >
          Start Inspection
        </Button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isPending ? (
          <div>Loading inspections...</div>
        ) : data.length === 0 ? (
          <div className="rounded border border-dashed p-6 text-center text-gray-500">
            No inspections scheduled
          </div>
        ) : (
          <ul className="space-y-3">
            {data.map((inspection) => (
              <li
                key={inspection.id}
                className="rounded border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-medium">{inspection.type}</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(inspection.date).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Status: {inspection.status}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
