"use client";

import { useEffect, useMemo, useState } from "react";
import { listDocuments, listProperties, type DocumentRecord } from "../lib/api";
import { useDocumentTags } from "../hooks/useDocumentTags";
import type { PropertySummary } from "../types/summary";

interface Props {
  refresh: number;
}

export default function DocumentsHub({ refresh }: Props) {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [tag, setTag] = useState("");
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const { tags } = useDocumentTags();

  useEffect(() => {
    listProperties().then(setProperties);
  }, []);

  useEffect(() => {
    listDocuments({ propertyId, tag, query: search }).then(setDocs);
  }, [propertyId, tag, search, refresh]);

  const availableTags = useMemo(() => {
    const entries = new Map<string, string>();

    tags.forEach((value) => {
      const normalized = value.trim();
      if (!normalized) return;
      const key = normalized.toLowerCase();
      if (!entries.has(key)) {
        entries.set(key, normalized);
      }
    });

    docs.forEach((doc) => {
      const normalized = doc.tag?.trim();
      if (!normalized) return;
      const key = normalized.toLowerCase();
      if (!entries.has(key)) {
        entries.set(key, normalized);
      }
    });

    return Array.from(entries.values());
  }, [docs, tags]);

  useEffect(() => {
    if (
      tag &&
      !availableTags.some((value) => value.toLowerCase() === tag.toLowerCase())
    ) {
      setTag("");
    }
  }, [availableTags, tag]);

  const propertyMap = useMemo(
    () => Object.fromEntries(properties.map((p) => [p.id, p.address])),
    [properties]
  );

  const controlStyles =
    "rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search documents"
          className={`${controlStyles} flex-1 min-w-[200px]`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Property filter"
          className={`${controlStyles} min-w-[180px]`}
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>
        <select
          aria-label="Tag filter"
          className={`${controlStyles} min-w-[160px]`}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {availableTags.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {doc.title}
              </a>
              <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {doc.tag?.trim() || "Other"}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {propertyMap[doc.propertyId ?? ""] ?? "General"}
              {doc.uploadedAt ? ` • ${new Date(doc.uploadedAt).toLocaleDateString()}` : ""}
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No documents found</p>
        )}
      </div>
    </div>
  );
}
