"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DocumentUploadModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  if (!open) return null;
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
          <button className="px-2 py-1 bg-gray-100" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-2 py-1 bg-blue-600 text-white"
            disabled={!file}
            onClick={onClose}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
