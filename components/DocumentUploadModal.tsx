"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile, createDocument } from "../lib/api";
import { DocumentTag } from "../types/document";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId?: string;
}

export default function DocumentUploadModal({ open, onClose, propertyId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  if (!open) return null;

  const handleUpload = async () => {
    if (!file) return;
    const { url } = await uploadFile(file);
    await createDocument({
      url,
      title: file.name,
      tag: DocumentTag.Other,
      propertyId,
    });
    // Refresh any document queries for this property
    if (propertyId) {
      queryClient.invalidateQueries({ queryKey: ["documents", propertyId] });
    }
    onClose();
    setFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded space-y-2 w-80">
        <h2 className="text-lg font-medium">Upload Document</h2>
        <input
          type="file"
          className="border p-1 w-full"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-2 py-1 bg-gray-100" onClick={() => { setFile(null); onClose(); }}>
            Cancel
          </button>
          <button
            className="px-2 py-1 bg-blue-600 text-white"
            disabled={!file}
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
