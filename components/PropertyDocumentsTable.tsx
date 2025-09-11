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
    <table className="min-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Uploaded</th>
          <th className="p-2 text-left">Link</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.id} className="border-t dark:border-gray-700">
            <td className="p-2">{d.name}</td>
            <td className="p-2">{d.uploaded}</td>
            <td className="p-2">
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
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

