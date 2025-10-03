"use client";

import { useEffect, useMemo, useState } from "react";
import { listProperties, uploadFile, createDocument } from "../lib/api";
import { logEvent } from "../lib/log";
import { useDocumentTags } from "../hooks/useDocumentTags";
import type { PropertySummary } from "../types/summary";

interface Props {
  onUploaded: () => void;
}

export default function DocumentUpload({ onUploaded }: Props) {
  const [propertyId, setPropertyId] = useState("");
  const [tag, setTag] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const { tags, addTag } = useDocumentTags();

  const fallbackTag = useMemo(() => {
    if (tags.length === 0) return "";
    const otherTag = tags.find((value) => value.toLowerCase() === "other");
    return otherTag ?? tags[0];
  }, [tags]);

  useEffect(() => {
    listProperties().then(setProperties);
  }, []);

  useEffect(() => {
    if (!tag && fallbackTag) {
      setTag(fallbackTag);
      return;
    }

    if (tag && !tags.some((value) => value.toLowerCase() === tag.toLowerCase())) {
      setTag(fallbackTag);
    }
  }, [fallbackTag, tag, tags]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !tag) return;
    const file = files[0];
    const { url } = await uploadFile(file);
    await createDocument({
      url,
      title: file.name,
      propertyId,
      tag,
      uploadedAt: new Date().toISOString(),
    });
    onUploaded();
    logEvent("document_upload", { propertyId, tag, title: file.name });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const controlStyles =
    "rounded border border-slate-300 bg-white p-1 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  return (
    <div className="space-y-2 text-slate-900 dark:text-slate-100">
      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Property"
          className={`${controlStyles} min-w-[160px] h-10`}
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        >
          <option value="">Select Property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>
        <select
          aria-label="Tag"
          className={`${controlStyles} min-w-[140px] h-10`}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="" disabled>
            Select a tag
          </option>
          {tags.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <div className="flex flex-1 min-w-[200px] gap-2">
          <input
            type="text"
            className={`${controlStyles} flex-1 h-10`}
            placeholder="Create a new tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const created = addTag(newTagName);
                if (created) {
                  setTag(created);
                  setNewTagName("");
                }
              }
            }}
          />
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={() => {
              const created = addTag(newTagName);
              if (created) {
                setTag(created);
                setNewTagName("");
              }
            }}
            disabled={!newTagName.trim()}
          >
            Add tag
          </button>
        </div>
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
      >
        Drag &amp; drop to upload
        <input
          type="file"
          data-testid="doc-upload"
          className="mx-auto mt-2 block text-slate-900 dark:text-slate-100"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
