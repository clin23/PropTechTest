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
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Uploaded</th>
          <th className="p-2 text-left">Link</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.id} className="border-t">
            <td className="p-2">{d.name}</td>
            <td className="p-2">{d.uploaded}</td>
            <td className="p-2">
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

