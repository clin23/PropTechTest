"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listPropertyDocuments } from "../lib/api";
import { formatShortDate } from "../lib/format";
import type { PropertyDocument } from "../types/property";
import { useScrollLockOnHover } from "../hooks/useScrollLockOnHover";

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

  const scrollRef = useScrollLockOnHover<HTMLDivElement>();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="card mx-4 overflow-visible rounded-xl">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-2 text-left">File Name</th>
                <th className="p-2 text-left">Notes</th>
                <th className="p-2 text-left">Links</th>
                <th className="p-2 text-left">Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => {
                const displayName = d.name?.trim() || d.title?.trim();
                return (
                  <tr key={d.id} className="border-t border-[var(--border)]">
                    <td className="p-2 align-top font-medium">
                      {displayName ?? "Untitled document"}
                    </td>
                    <td className="p-2 align-top text-sm text-gray-600 whitespace-pre-line">
                      {d.notes ? d.notes : "—"}
                    </td>
                    <td className="p-2 align-top text-sm">
                      <div className="flex flex-col gap-1">
                        {d.url ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--primary)] underline"
                          >
                            Open document
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                        {(d.links ?? []).map((link) => (
                          <a
                            key={link}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--primary)] underline"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 align-top text-sm text-gray-600">
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
  );
}

