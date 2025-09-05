"use client";

import { useEffect, useState } from "react";
import {
  listDocuments,
  uploadDocument,
  type DocumentRecord,
} from "../lib/api";

const TAGS = ["Lease", "Expense", "Compliance", "Insurance", "Other"];

export default function DocumentsHub() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [allDocs, setAllDocs] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [property, setProperty] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    listDocuments().then((d) => {
      setDocs(d);
      setAllDocs(d);
    });
  }, []);

  const properties = Array.from(new Set(allDocs.map((d) => d.property))).filter(
    Boolean
  );

  const filtered = docs.filter(
    (d) =>
      (!search || d.name.toLowerCase().includes(search.toLowerCase())) &&
      (!property || d.property === property) &&
      (!tag || d.tag === tag)
  );

  const refresh = async () => {
    const d = await listDocuments();
    setDocs(d);
    setAllDocs(d);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadDocument(file, property, tag || "Other");
    await refresh();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

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
          value={property}
          onChange={(e) => setProperty(e.target.value)}
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p} value={p}>
              {p}
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
          {TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed p-4 text-center"
      >
        Drag & drop to upload
        <input
          type="file"
          data-testid="doc-upload"
          className="block mx-auto mt-2"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <div className="space-y-2">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="flex justify-between border p-2 rounded"
          >
            <span>{doc.name}</span>
            <span className="text-xs text-gray-600">
              {doc.property} - {doc.tag}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <p>No documents found</p>}
      </div>
    </div>
  );
}
