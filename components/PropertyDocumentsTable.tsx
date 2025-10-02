"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listPropertyDocuments } from "../lib/api";
import type { PropertyDocument } from "../types/property";

export default function PropertyDocumentsTable({
  propertyId: propId,
}: {
  propertyId?: string;
}) {
  const params = useParams<{ propertyId?: string; id?: string }>();
  const propertyId = propId ?? params.propertyId ?? params.id ?? "";
  const { data = [] } = useQuery<PropertyDocument[]>({
    queryKey: ["documents", propertyId],
    queryFn: () => listPropertyDocuments(propertyId),
  });

  return (
    <div className="card mx-4 overflow-hidden rounded-xl">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Uploaded</th>
            <th className="p-2 text-left">Link</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-t border-[var(--border)]">
              <td className="p-2">{d.name}</td>
              <td className="p-2">{d.uploaded}</td>
              <td className="p-2">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--primary)] underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

