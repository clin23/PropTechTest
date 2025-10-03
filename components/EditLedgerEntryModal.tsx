"use client";

import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { uploadFile } from "../lib/api";
import type { LedgerEntry, LedgerStatus } from "../types/property";

interface Props {
  entry: LedgerEntry;
  onSave: (entry: LedgerEntry) => void | Promise<void>;
  onClose: () => void;
}

const TRANSITION_MS = 200;

export default function EditLedgerEntryModal({ entry, onSave, onClose }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [datePaid, setDatePaid] = useState(entry.date);
  const [amount, setAmount] = useState(entry.amount.toString());
  const [status, setStatus] = useState<LedgerStatus>(entry.status);
  const [evidenceUrl, setEvidenceUrl] = useState(entry.evidenceUrl ?? "");
  const [evidenceName, setEvidenceName] = useState(entry.evidenceName ?? "");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setDatePaid(entry.date);
    setAmount(entry.amount.toString());
    setStatus(entry.status);
    setEvidenceUrl(entry.evidenceUrl ?? "");
    setEvidenceName(entry.evidenceName ?? "");
    setEvidenceFile(null);
    setError(null);
  }, [entry]);

  const daysLate = useMemo(() => {
    if (status !== "paid") return 0;
    const due = new Date(entry.date).getTime();
    const paid = new Date(datePaid).getTime();
    if (Number.isNaN(due) || Number.isNaN(paid)) return 0;
    const diff = Math.floor((paid - due) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [datePaid, entry.date, status]);

  const handleRequestClose = () => {
    setIsVisible(false);
    setTimeout(onClose, TRANSITION_MS);
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleRequestClose();
  };

  const handleFileChange = (file: File | null) => {
    setEvidenceFile(file);
    if (file) {
      setEvidenceName(file.name);
      setEvidenceUrl("");
    }
  };

  const handleClearEvidence = () => {
    setEvidenceUrl("");
    setEvidenceName("");
    setEvidenceFile(null);
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      let nextEvidenceUrl = evidenceUrl.trim();
      let nextEvidenceName = evidenceName.trim();

      if (evidenceFile) {
        const upload = await uploadFile(evidenceFile);
        nextEvidenceUrl = upload.url;
        nextEvidenceName = evidenceFile.name;
      }

      const originalUrl = entry.evidenceUrl ?? "";
      const originalName = entry.evidenceName ?? "";
      const hasManualChange =
        !!evidenceFile ||
        nextEvidenceUrl !== originalUrl ||
        nextEvidenceName !== originalName;

      const shouldClearEvidence =
        !nextEvidenceUrl && !nextEvidenceName && !evidenceFile && !!entry.evidenceUrl;

      const resolvedEvidenceUrl = shouldClearEvidence
        ? null
        : nextEvidenceUrl || (hasManualChange ? null : entry.evidenceUrl ?? null);

      const resolvedEvidenceName = shouldClearEvidence
        ? null
        : nextEvidenceName ||
          (hasManualChange
            ? evidenceFile
              ? evidenceFile.name
              : null
            : entry.evidenceName ?? null);

      await onSave({
        ...entry,
        date: datePaid,
        amount: parseFloat(amount) || 0,
        status,
        evidenceUrl: resolvedEvidenceUrl,
        evidenceName: resolvedEvidenceName,
      });

      setIsVisible(false);
      setTimeout(onClose, TRANSITION_MS);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Failed to save changes";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-80 max-w-[90vw] transform rounded-lg bg-white p-4 shadow-lg transition-all duration-200 dark:bg-gray-800 ${
          isVisible ? "scale-100 opacity-100" : "-translate-y-2 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Ledger Entry</h2>
        <div className="mb-3">
          <label className="mb-1 block text-sm">Date Paid</label>
          <input
            type="date"
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
            value={datePaid}
            onChange={(e) => setDatePaid(e.target.value)}
          />
          {daysLate > 0 && (
            <p className="mt-1 text-sm text-red-500">Late by {daysLate} day(s)</p>
          )}
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm">Status</label>
          <select
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
            value={status}
            onChange={(e) => setStatus(e.target.value as LedgerStatus)}
          >
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="follow_up">Follow up</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm">Amount</label>
          <input
            type="number"
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-3 text-sm">
          <p>Balance: {entry.balance}</p>
        </div>
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm">Evidence</label>
            {(evidenceUrl || evidenceFile || entry.evidenceUrl) && (
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-400"
                onClick={handleClearEvidence}
              >
                Clear
              </button>
            )}
          </div>
          {entry.evidenceUrl && !evidenceFile && evidenceUrl === entry.evidenceUrl && (
            <a
              href={entry.evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 inline-flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-sm text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200"
            >
              <span className="truncate">{entry.evidenceName ?? "View evidence"}</span>
            </a>
          )}
          {evidenceFile && (
            <div className="mb-2 rounded border border-dashed border-blue-300 px-2 py-1 text-xs text-blue-600 dark:border-blue-500 dark:text-blue-200">
              Selected file: {evidenceFile.name}
            </div>
          )}
          <input
            type="file"
            accept="application/pdf,image/*"
            className="w-full rounded border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div className="mt-2 space-y-2 text-sm">
            <input
              type="url"
              placeholder="Paste a link to evidence"
              className="w-full rounded border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              value={evidenceUrl}
              onChange={(e) => {
                setEvidenceUrl(e.target.value);
                if (e.target.value) {
                  setEvidenceFile(null);
                }
              }}
            />
            <input
              type="text"
              placeholder="Evidence name (optional)"
              className="w-full rounded border p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Upload a new document or provide a link. Clearing the fields will remove existing
            evidence.
          </p>
        </div>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded bg-gray-200 px-4 py-2 text-sm transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={handleRequestClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  ,
    document.body,
  );
}

