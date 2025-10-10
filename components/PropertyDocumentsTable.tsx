"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listPropertyDocuments } from "../lib/api";
import { formatShortDate } from "../lib/format";
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-4 pt-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">File Name</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-left">Links</th>
                  <th className="px-4 py-3 text-left">Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => {
                  const displayName = d.name?.trim() || d.title?.trim();
                  return (
                    <tr key={d.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 align-top font-medium text-gray-900 dark:text-gray-100">
                        {displayName ?? "Untitled document"}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-gray-600 whitespace-pre-line dark:text-gray-300">
                        {d.notes ? d.notes : "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-sm">
                        <div className="flex flex-col gap-1">
                          {d.url ? (
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline dark:text-blue-400"
                            >
                              Open document
                            </a>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">—</span>
                          )}
                          {(d.links ?? []).map((link) => (
                            <a
                              key={link}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline break-words dark:text-blue-400"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-gray-600 dark:text-gray-300">
                        {formatShortDate(d.uploadedAt ?? d.uploaded)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

