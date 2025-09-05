"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApplicantTabs from "../../../components/ApplicantTabs";
import {
  getApplication,
  updateApplication,
  postScore,
} from "../../../lib/api";
import type { Application } from "../../../lib/api";

export default function ApplicationDetail({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const { data: application } = useQuery<Application>({
    queryKey: ["application", params.id],
    queryFn: () => getApplication(params.id),
  });

  const update = useMutation({
    mutationFn: (status: string) =>
      updateApplication(params.id, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["application", params.id] }),
  });

  const score = useMutation({
    mutationFn: (decision: string) => postScore(params.id, { decision }),
  });

  const handleDecision = (decision: "Accepted" | "Rejected") => {
    update.mutate(decision);
    score.mutate(decision);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Application {params.id}</h1>
        <div className="space-x-2">
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={() => handleDecision("Accepted")}
          >
            Accept
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={() => handleDecision("Rejected")}
          >
            Reject
          </button>
        </div>
      </div>
      <ApplicantTabs application={application} />
    </div>
  );
}
