"use client";
import { useState, useEffect } from "react";
import type { TaskDto } from "../../types/tasks";
import type { PropertySummary } from "../../types/property";
import type { Vendor } from "../../lib/api";
import {
  STATUS_INDICATOR_OPTIONS,
  coerceStatusIndicatorValue,
  deriveIndicatorForTask,
  mergeIndicatorIntoTags,
  type StatusIndicatorValue,
} from "./statusIndicator";

export default function TaskEditModal({
  task,
  properties,
  vendors,
  onClose,
  onSave,
  onArchive,
}: {
  task: TaskDto;
  properties: PropertySummary[];
  vendors: Vendor[];
  onClose: () => void;
  onSave: (data: Partial<TaskDto>) => void;
  onArchive: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [dueTime, setDueTime] = useState(task.dueTime ?? "");
  const [selectedProps, setSelectedProps] = useState<string[]>(
    task.properties.map((p) => p.id)
  );
  const [statusIndicator, setStatusIndicator] = useState<StatusIndicatorValue>(
    deriveIndicatorForTask({ status: task.status, tags: task.tags })
  );
  const [vendorId, setVendorId] = useState<string>(task.vendor?.id ?? "");
  const [attachments, setAttachments] = useState<
    TaskDto["attachments"]
  >(task.attachments ?? []);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setDueDate(task.dueDate ?? "");
    setDueTime(task.dueTime ?? "");
    setSelectedProps(task.properties.map((p) => p.id));
    setVendorId(task.vendor?.id ?? "");
    setAttachments(task.attachments ?? []);
    setStatusIndicator(
      deriveIndicatorForTask({ status: task.status, tags: task.tags })
    );
  }, [task]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setAttachments((a) => [...(a ?? []), ...arr]);
  };

  const handleSave = () => {
    const props = selectedProps
      .map((id) => properties.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, address: p!.address }));
    const vendor = vendorId
      ? vendors.find((v) => v.id === vendorId)
      : undefined;
    const nextTags = mergeIndicatorIntoTags(task.tags, statusIndicator);

    onSave({
      title,
      description,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      properties: props,
      vendor: vendor ? { id: vendor.id!, name: vendor.name } : null,
      attachments,
      tags: nextTags,
    });
  };

  const handleClose = () => {
    handleSave();
    onClose();
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative w-[32rem] rounded-xl bg-white p-6 shadow space-y-4 dark:bg-gray-800 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-2 top-2 text-xl"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div className="absolute right-2 top-8 rounded-md border bg-white shadow dark:bg-gray-700">
            <button
              onClick={() => {
                handleSave();
                onArchive();
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Archive
            </button>
          </div>
        )}
        <h2 className="text-lg font-semibold">Task Details</h2>
        <input
          className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2 text-sm">
          <label className="flex flex-1 flex-col dark:text-gray-200">
            Due date
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <label className="flex flex-1 flex-col dark:text-gray-200">
            Time
            <input
              type="time"
              className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label className="mb-1 block text-sm dark:text-gray-200">Property</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={selectedProps[0] ?? ""}
            onChange={(e) => setSelectedProps(e.target.value ? [e.target.value] : [])}
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm dark:text-gray-200">Vendor</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          >
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm dark:text-gray-200">Status</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={statusIndicator}
            onChange={(e) =>
              setStatusIndicator(
                coerceStatusIndicatorValue(e.target.value)
              )
            }
          >
            {STATUS_INDICATOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm dark:text-gray-200">Attachments</label>
          <input
            type="file"
            multiple
            className="text-sm text-gray-700 dark:text-gray-200"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {attachments?.length ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {attachments.map((a, i) => (
                <li key={a.url} className="flex items-center justify-between">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:no-underline"
                  >
                    {a.name}
                  </a>
                  <button
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={() =>
                      setAttachments((att) =>
                        (att ?? []).filter((_, idx) => idx !== i)
                      )
                    }
                    aria-label={`Remove ${a.name}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
