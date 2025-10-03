"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile, createDocument } from "../lib/api";
import { DocumentTag } from "../types/document";
import ModalPortal from "./ModalPortal";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId?: string;
}

export default function DocumentUploadModal({ open, onClose, propertyId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

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
    <AnimatePresence>
      {open && (
        <ModalPortal key="document-modal">
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
              setFile(null);
              onClose();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-xs space-y-2 rounded-lg bg-white p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-medium">Upload Document</h2>
              <input
                type="file"
                className="w-full rounded border p-1"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="rounded bg-gray-100 px-2 py-1"
                  onClick={() => {
                    setFile(null);
                    onClose();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-blue-600 px-2 py-1 text-white disabled:opacity-60"
                  disabled={!file}
                  onClick={handleUpload}
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}
