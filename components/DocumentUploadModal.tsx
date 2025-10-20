"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { uploadFile, createDocument } from "../lib/api";
import { useDocumentTags } from "../hooks/useDocumentTags";
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
  const [selectedTag, setSelectedTag] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const queryClient = useQueryClient();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { tags, addTag } = useDocumentTags();

  const fallbackTag = useMemo(() => {
    if (tags.length === 0) return "";
    const otherTag = tags.find((tag) => tag.toLowerCase() === "other");
    return otherTag ?? tags[0];
  }, [tags]);

  const resetUploadState = useCallback(() => {
    setFile(null);
    setFileName("");
    setNotes("");
    setLinks("");
    setSelectedTag(fallbackTag);
    setNewTagName("");
    setIsSubmitting(false);
    setShowSuccess(false);
  }, [fallbackTag]);

  useEffect(() => {
    if (!selectedTag && fallbackTag) {
      setSelectedTag(fallbackTag);
      return;
    }

    if (
      selectedTag &&
      !tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
    ) {
      setSelectedTag(fallbackTag);
    }
  }, [fallbackTag, selectedTag, tags]);

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
    if (!file || !fileName.trim() || !selectedTag || isSubmitting) return;
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
        tag: selectedTag,
        propertyId,
        notes: notes.trim() || undefined,
        links: parsedLinks.length > 0 ? parsedLinks : undefined,
        uploadedAt: new Date().toISOString(),
      });
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

  const inputStyles =
    "mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

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
              className="w-full max-w-[500px] max-h-[500px] space-y-4 overflow-y-auto rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900 dark:text-slate-100"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Upload Document</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add details to keep everything organised for this property.
                </p>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Document File
                  <input
                    type="file"
                    className={`${inputStyles} cursor-pointer`}
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null;
                      setFile(selected);
                      if (selected) {
                        setFileName(selected.name);
                      }
                    }}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  File Name
                  <input
                    type="text"
                    className={inputStyles}
                    placeholder="e.g. Lease Agreement"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tag
                  <div className="mt-1 space-y-2">
                    <select
                      className={inputStyles}
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a tag
                      </option>
                      {tags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        className={`${inputStyles} h-10 sm:flex-1`}
                        placeholder="Create a new tag"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            const created = addTag(newTagName);
                            if (created) {
                              setSelectedTag(created);
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
                            setSelectedTag(created);
                            setNewTagName("");
                          }
                        }}
                        disabled={!newTagName.trim()}
                      >
                        Add tag
                      </button>
                    </div>
                  </div>
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Notes
                  <textarea
                    className={inputStyles}
                    placeholder="Add any relevant context"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Links
                  <textarea
                    className={inputStyles}
                    placeholder="Paste any related URLs (separate with commas or line breaks)"
                    rows={2}
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Upload date will be recorded automatically.</span>
              </div>
              <div className="relative flex justify-end gap-2 pt-2">
                <button
                  className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  disabled={isSubmitting}
                  onClick={() => {
                    handleClose();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-60"
                  disabled={!file || !fileName.trim() || !selectedTag || isSubmitting || showSuccess}
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
                      className="absolute -right-2 top-full mt-2 flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 shadow dark:bg-green-900 dark:text-green-200"
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
