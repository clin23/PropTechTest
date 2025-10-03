"use client";

import { useEffect, useState } from "react";
import { listProperties, uploadFile, createDocument } from "../lib/api";
import { logEvent } from "../lib/log";
import { DocumentTag } from "../types/document";
import type { PropertySummary } from "../types/summary";

interface Props {
  onUploaded: () => void;
}

export default function DocumentUpload({ onUploaded }: Props) {
  const [propertyId, setPropertyId] = useState("");
  const [tag, setTag] = useState<DocumentTag>(DocumentTag.Other);
  const [properties, setProperties] = useState<PropertySummary[]>([]);

  useEffect(() => {
    listProperties().then(setProperties);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
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

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          aria-label="Property"
          className="border p-1"
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
          className="border p-1"
          value={tag}
          onChange={(e) => setTag(e.target.value as DocumentTag)}
        >
          {Object.values(DocumentTag).map((t) => (
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
    </div>
  );
}
