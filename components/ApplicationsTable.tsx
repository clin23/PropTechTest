"use client";

import { useRouter } from "next/navigation";
import EmptyState from "./EmptyState";
import type { ApplicationRow } from "../types/application";

export default function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter();

  if (!rows.length) {
    return <EmptyState message="No applications found." />;
  }

  const openDetails = (id: string) => router.push(`/applications/${id}`);

  return (
    <table className="min-w-full border border-[var(--border)]">
      <thead>
        <tr className="bg-bg-elevated">
          <th className="p-2 text-left">Applicant</th>
          <th className="p-2 text-left">Property</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className="border-t border-[var(--border)] cursor-pointer even:bg-[var(--zebra)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ring-offset-2 ring-offset-[var(--bg-base)]"
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
