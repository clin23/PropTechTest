"use client";

import { useRouter } from "next/navigation";
import EmptyState from "./EmptyState";

export interface ApplicationRow {
  id: string;
  applicant: string;
  property: string;
  status: string;
}

export default function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter();

  if (!rows.length) {
    return <EmptyState message="No applications found." />;
  }

  const openDetails = (id: string) => router.push(`/applications/${id}`);

  return (
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Applicant</th>
          <th className="p-2 text-left">Property</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className="border-t cursor-pointer hover:bg-gray-50"
            role="button"
            tabIndex={0}
            onClick={() => openDetails(r.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetails(r.id);
              }
            }}
          >
            <td className="p-2">{r.applicant}</td>
            <td className="p-2">{r.property}</td>
            <td className="p-2">
              {r.status}
              <span className="sr-only">Open application details</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
