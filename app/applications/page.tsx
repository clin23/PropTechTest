"use client";

import { useQuery } from "@tanstack/react-query";
import ApplicationsTable, {
  ApplicationRow,
} from "../../components/ApplicationsTable";
import { listApplications } from "../../lib/api";

export default function ApplicationsPage() {
  const { data: rows } = useQuery<ApplicationRow[]>({
    queryKey: ["applications"],
    queryFn: listApplications,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>
      <ApplicationsTable rows={rows || []} />
    </div>
  );
}
