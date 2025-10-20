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

const TRANSITION_MS = 300;

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
  const [confirmationProgress, setConfirmationProgress] = useState(0);
  const isConfirmed = confirmationProgress >= 100;
  const sliderPromptTone =
    isConfirmed || confirmationProgress >= 56
      ? "text-white"
      : "text-gray-900 dark:text-white/80";

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
    setConfirmationProgress(0);
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
    setConfirmationProgress(0);
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
    if (!isConfirmed) {
      setError("Slide to confirm before saving your changes.");
      return;
    }

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
      setConfirmationProgress(0);
    }
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out dark:bg-gray-800 ${
          isVisible ? "scale-100 opacity-100" : "-translate-y-3 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Ledger Entry</h2>
        <div className="grid gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Paid</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
            />
            {daysLate > 0 && (
              <p className="text-xs text-red-500">Late by {daysLate} day(s)</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700"
              value={status}
              onChange={(e) => setStatus(e.target.value as LedgerStatus)}
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="follow_up">Follow up</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-1 text-sm text-gray-600 dark:text-gray-300">
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Balance</span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{entry.balance}</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Evidence</label>
            {(evidenceUrl || evidenceFile || entry.evidenceUrl) && (
              <button
                type="button"
                className="text-xs font-medium text-red-500 transition hover:text-red-400"
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
              className="mb-2 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200"
            >
              <span className="truncate">{entry.evidenceName ?? "View evidence"}</span>
            </a>
          )}
          {evidenceFile && (
            <div className="mb-2 rounded-lg border border-dashed border-blue-300 px-3 py-1.5 text-xs text-blue-600 dark:border-blue-500 dark:text-blue-200">
              Selected file: {evidenceFile.name}
            </div>
          )}
          <input
            type="file"
            accept="application/pdf,image/*"
            className="w-full rounded-lg border border-dashed border-gray-300 p-3 text-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div className="mt-2 space-y-2 text-sm">
            <input
              type="url"
              placeholder="Paste a link to evidence"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700"
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
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Upload a new document or provide a link. Clearing the fields will remove existing
            evidence.
          </p>
        </div>
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm changes
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative flex h-10 w-full items-center overflow-hidden rounded-full bg-gray-100 shadow-inner transition-colors dark:bg-black sm:flex-1">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full transition-all duration-200 ease-out"
                style={{
                  transformOrigin: "left center",
                  transform: `scaleX(${Math.min(Math.max(confirmationProgress, 0), 100) / 100})`,
                  background: isConfirmed
                    ? "#16a34a"
                    : "linear-gradient(90deg, #000000 0%, #16a34a 100%)",
                  opacity: confirmationProgress > 0 ? 1 : 0,
                  willChange: "transform, background",
                }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={confirmationProgress}
                onChange={(e) => {
                  const nextValue = Number(e.target.value);
                  setConfirmationProgress(nextValue >= 96 ? 100 : nextValue);
                }}
                className="confirm-slider"
              />
              <span
                className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-xs font-semibold uppercase tracking-wide transition-colors ${sliderPromptTone}`}
              >
                {isConfirmed ? "Confirmed" : "Slide right to confirm"}
              </span>
            </div>
            <div className="flex shrink-0 justify-end gap-3">
              <button
                className="h-10 rounded-lg bg-gray-200 px-4 text-sm font-medium transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                onClick={handleRequestClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                onClick={handleSave}
                disabled={isSaving || !isConfirmed}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  ,
    document.body,
  );
}

