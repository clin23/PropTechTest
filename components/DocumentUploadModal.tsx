"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
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
  const [fileName, setFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const queryClient = useQueryClient();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetUploadState = useCallback(() => {
    setFile(null);
    setFileName("");
    setNotes("");
    setLinks("");
    setIsSubmitting(false);
    setShowSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    resetUploadState();
    onClose();
  }, [onClose, resetUploadState]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      resetUploadState();
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, open, resetUploadState]);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 1200);
  }, [handleClose]);

  const handleUpload = async () => {
    if (!file || !fileName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { url } = await uploadFile(file);
      const parsedLinks = links
        .split(/\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
      await createDocument({
        url,
        title: fileName.trim(),
        tag: DocumentTag.Other,
        propertyId,
        notes: notes.trim() || undefined,
        links: parsedLinks.length > 0 ? parsedLinks : undefined,
        uploadedAt: new Date().toISOString(),
      });
      // Refresh any document queries for this property
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ["documents", propertyId] });
      }
      setShowSuccess(true);
      scheduleClose();
    } catch (error) {
      console.error("Failed to upload document", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <ModalPortal key="document-modal">
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
              handleClose();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Upload Document</h2>
                <p className="text-sm text-gray-500">
                  Add details to keep everything organised for this property.
                </p>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Document File
                  <input
                    type="file"
                    className="mt-1 w-full rounded border p-2 text-sm"
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null;
                      setFile(selected);
                      if (selected) {
                        setFileName(selected.name);
                      }
                    }}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  File Name
                  <input
                    type="text"
                    className="mt-1 w-full rounded border p-2 text-sm"
                    placeholder="e.g. Lease Agreement"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                  <textarea
                    className="mt-1 w-full rounded border p-2 text-sm"
                    placeholder="Add any relevant context"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Links
                  <textarea
                    className="mt-1 w-full rounded border p-2 text-sm"
                    placeholder="Paste any related URLs (separate with commas or line breaks)"
                    rows={2}
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                <span>Upload date will be recorded automatically.</span>
              </div>
              <div className="relative flex justify-end gap-2 pt-2">
                <button
                  className="rounded bg-gray-100 px-2 py-1"
                  disabled={isSubmitting}
                  onClick={() => {
                    handleClose();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-60"
                  disabled={!file || !fileName.trim() || isSubmitting || showSuccess}
                  onClick={handleUpload}
                >
                  {showSuccess ? "Saved" : isSubmitting ? "Uploading..." : "Upload"}
                </button>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      key="upload-success"
                      initial={{ opacity: 0, x: 12, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 12, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -right-2 top-full mt-2 flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 shadow"
                      role="status"
                      aria-live="polite"
                    >
                      <span aria-hidden>✓</span>
                      <span>Document saved to Documents tab</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>,
    portalTarget,
  );
}
