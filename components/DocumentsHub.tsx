"use client";

import { useEffect, useState } from "react";
import { listDocuments, listProperties, type DocumentRecord } from "../lib/api";
import { DocumentTag } from "../types/document";
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

  useEffect(() => {
    listProperties().then(setProperties);
  }, []);

  useEffect(() => {
    listDocuments({ propertyId, tag, query: search }).then(setDocs);
  }, [propertyId, tag, search, refresh]);

  const propertyMap = Object.fromEntries(
    properties.map((p) => [p.id, p.address])
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          placeholder="Search documents"
          className="border p-1 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Property filter"
          className="border p-1"
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
          className="border p-1"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {Object.values(DocumentTag).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex justify-between border p-2 rounded"
          >
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-600"
            >
              {doc.title}
            </a>
            <span className="text-xs text-gray-600">
              {propertyMap[doc.propertyId ?? ""]} - {doc.tag}
            </span>
          </div>
        ))}
        {docs.length === 0 && <p>No documents found</p>}
      </div>
    </div>
  );
}
