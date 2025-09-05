"use client";

import { useRouter } from "next/navigation";
import type { ApplicationRow } from "../types/application";

export default function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter();
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
            onClick={() => router.push(`/applications/${r.id}`)}
          >
            <td className="p-2">{r.applicant}</td>
            <td className="p-2">{r.property}</td>
            <td className="p-2">{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
