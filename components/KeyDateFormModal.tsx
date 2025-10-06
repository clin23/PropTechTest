"use client";

import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type {
  Reminder,
  ReminderChecklistItem,
  ReminderDocument,
} from "../lib/api";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ModalPortal from "./ModalPortal";

export type KeyDateFormValues = {
  propertyId: string;
  type: Reminder["type"];
  title: string;
  dueDate: string;
  dueTime?: string;
  recurrence?: string | null;
  severity: Reminder["severity"];
  documents: ReminderDocument[];
  checklist: ReminderChecklistItem[];
  addToTasks: boolean;
};

interface KeyDateFormModalProps {
  open: boolean;
  propertyId: string;
  initialData?: Reminder | null;
  onSubmit: (values: KeyDateFormValues) => void;
  onClose: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  error?: string | null;
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const reminderTypeOptions: { value: Reminder["type"]; label: string }[] = [
  { value: "lease_expiry", label: "Lease expiry" },
  { value: "rent_review", label: "Rent review" },
  { value: "insurance_renewal", label: "Insurance renewal" },
  { value: "inspection_due", label: "Inspection due" },
  { value: "custom", label: "Custom" },
];

const severityOptions: { value: Reminder["severity"]; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "med", label: "Medium" },
  { value: "high", label: "High" },
];

export default function KeyDateFormModal({
  open,
  propertyId,
  initialData,
  onSubmit,
  onClose,
  onDelete,
  isSaving,
  isDeleting,
  error,
}: KeyDateFormModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [type, setType] = useState<Reminder["type"]>(initialData?.type ?? "custom");
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(initialData?.dueTime ?? "");
  const [recurrence, setRecurrence] = useState(initialData?.recurrence ?? "");
  const [severity, setSeverity] = useState<Reminder["severity"]>(initialData?.severity ?? "low");
  const [documents, setDocuments] = useState<ReminderDocument[]>(
    initialData?.documents ?? [],
  );
  const [checklist, setChecklist] = useState<ReminderChecklistItem[]>(
    initialData?.checklist ?? [],
  );
  const [addToTasks, setAddToTasks] = useState(Boolean(initialData?.taskId));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTitle(initialData?.title ?? "");
    setType(initialData?.type ?? "custom");
    setDueDate(initialData?.dueDate ?? "");
    setDueTime(initialData?.dueTime ?? "");
    setRecurrence(initialData?.recurrence ?? "");
    setSeverity(initialData?.severity ?? "low");
    setDocuments(initialData?.documents ?? []);
    setChecklist(initialData?.checklist ?? []);
    setAddToTasks(Boolean(initialData?.taskId));
  }, [initialData, open]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  const canSave = title.trim().length > 0 && dueDate.trim().length > 0;

  const sanitizedDocuments = useMemo(() => {
    return documents
      .map((doc) => ({
        ...doc,
        name: doc.name.trim(),
        url: doc.url?.trim() || undefined,
      }))
      .filter((doc) => doc.name.length > 0);
  }, [documents]);

  const sanitizedChecklist = useMemo(() => {
    return checklist
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);
  }, [checklist]);

  const handleSubmit = () => {
    if (!canSave || isSaving) return;
    onSubmit({
      propertyId,
      title: title.trim(),
      type,
      dueDate,
      dueTime: dueTime.trim() ? dueTime : undefined,
      recurrence: recurrence ? recurrence : null,
      severity,
      documents: sanitizedDocuments,
      checklist: sanitizedChecklist,
      addToTasks,
    });
  };

  const renderDocuments = () => {
    if (documents.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Attach reference documents or leave blank.
        </p>
      );
    }
    return documents.map((doc, index) => (
      <div key={doc.id} className="space-y-2 rounded border p-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Document {index + 1}</span>
          <button
            type="button"
            className="text-red-500 hover:underline"
            onClick={() =>
              setDocuments((prev) => prev.filter((item) => item.id !== doc.id))
            }
          >
            Remove
          </button>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Name
          </span>
          <input
            id={`${doc.id}-name`}
            className="w-full rounded border px-2 py-1 text-sm"
            value={doc.name}
            onChange={(event) => {
              const { value } = event.target;
              setDocuments((prev) =>
                prev.map((item) =>
                  item.id === doc.id ? { ...item, name: value } : item,
                ),
              );
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Link (optional)
          </span>
          <input
            id={`${doc.id}-url`}
            className="w-full rounded border px-2 py-1 text-sm"
            value={doc.url ?? ""}
            onChange={(event) => {
              const { value } = event.target;
              setDocuments((prev) =>
                prev.map((item) =>
                  item.id === doc.id ? { ...item, url: value } : item,
                ),
              );
            }}
          />
        </label>
      </div>
    ));
  };

  const renderChecklist = () => {
    if (checklist.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Break work into actionable checklist items.
        </p>
      );
    }
    return checklist.map((item, index) => (
      <div key={item.id} className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{index + 1}.</span>
        <input
          className="flex-1 rounded border px-2 py-1 text-sm"
          value={item.text}
          onChange={(event) => {
            const { value } = event.target;
            setChecklist((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, text: value } : entry,
              ),
            );
          }}
        />
        <button
          type="button"
          className="text-xs text-red-500 hover:underline"
          onClick={() => setChecklist((prev) => prev.filter((entry) => entry.id !== item.id))}
        >
          Remove
        </button>
      </div>
    ));
  };

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => setIsAnimatingIn(true));

    return () => {
      cancelAnimationFrame(frame);
      setIsAnimatingIn(false);
    };
  }, [open]);

  if (!open || !portalTarget) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-6 transition-opacity duration-300 ${isAnimatingIn ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      data-testid="key-date-modal"
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`max-h-[90vh] w-full max-w-2xl transform overflow-auto rounded-xl bg-white p-6 shadow-xl transition-all duration-300 ease-out ${isAnimatingIn ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"} dark:bg-gray-900 dark:text-white`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-4 space-y-1">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit key date" : "Add key date"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Capture key reminders, documents, and next steps for this property.
          </p>
        </header>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Key date name
              </span>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Category
              </span>
              <select
                className="w-full rounded border px-3 py-2 text-sm"
                value={type}
                onChange={(event) => setType(event.target.value as Reminder["type"])}
              >
                {reminderTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Due date
              </span>
              <input
                type="date"
                className="w-full rounded border px-3 py-2 text-sm"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Time (optional)
              </span>
              <input
                type="time"
                className="w-full rounded border px-3 py-2 text-sm"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Recurrence / time set
              </span>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="e.g. Annual, Quarterly, Custom"
                value={recurrence ?? ""}
                onChange={(event) => setRecurrence(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Priority
              </span>
              <select
                className="w-full rounded border px-3 py-2 text-sm"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as Reminder["severity"])}
              >
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <section className="space-y-2">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Key documents</h3>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                  setDocuments((prev) => [
                    ...prev,
                    { id: generateId("doc"), name: "", url: "" },
                  ])
                }
              >
                + Add document
              </button>
            </header>
            <div className="space-y-3">{renderDocuments()}</div>
          </section>
          <section className="space-y-2">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Checklist of actions</h3>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                  setChecklist((prev) => [
                    ...prev,
                    { id: generateId("check"), text: "" },
                  ])
                }
              >
                + Add checklist item
              </button>
            </header>
            <div className="space-y-2">{renderChecklist()}</div>
          </section>
          <label className="flex items-start gap-3 rounded border px-3 py-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={addToTasks}
              onChange={(event) => setAddToTasks(event.target.checked)}
            />
            <span>
              <span className="block font-medium">Add to tasks board</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                A linked task will be {initialData?.taskId ? "updated" : "created"} with
                this checklist in the description.
              </span>
            </span>
          </label>
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3">
            {initialData && onDelete && (
              <button
                type="button"
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                Delete key date
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className="rounded border px-4 py-2 text-sm"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                onClick={handleSubmit}
                disabled={!canSave || isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </footer>
        </div>
        {showDeleteConfirm && onDelete && (
          <ConfirmDeleteModal
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={onDelete}
            word="delete"
          />
        )}
      </div>
    </div>,
    portalTarget,
  );
}
