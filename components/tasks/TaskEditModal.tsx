"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { TaskDto } from "../../types/tasks";
import type { PropertySummary } from "../../types/property";
import type { Vendor } from "../../lib/api";
import {
  STATUS_INDICATOR_PRESETS,
  normalizeStatusIndicatorValue,
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

  const updateStatusIndicator = useCallback(
    (value: Partial<StatusIndicatorValue>) => {
      setStatusIndicator((prev) =>
        normalizeStatusIndicatorValue({ ...prev, ...value })
      );
    },
    []
  );

  const initialPayloadRef = useRef<string>();

  const createPayload = useCallback(
    ({
      title: draftTitle,
      description: draftDescription,
      dueDate: draftDueDate,
      dueTime: draftDueTime,
      selectedProps: draftSelectedProps,
      vendorId: draftVendorId,
      attachments: draftAttachments,
      statusIndicator: draftIndicator,
    }: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      selectedProps: string[];
      vendorId: string;
      attachments: TaskDto["attachments"];
      statusIndicator: StatusIndicatorValue;
    }) => {
      const resolvedProperties = draftSelectedProps
        .map((id) => {
          const property =
            properties.find((p) => p.id === id) ??
            task.properties.find((p) => p.id === id);
          return property ? { id: property.id, address: property.address } : null;
        })
        .filter(
          (value): value is TaskDto["properties"][number] => value !== null
        );

      const resolvedVendor = draftVendorId
        ? (() => {
            const fromList = vendors.find((v) => v.id === draftVendorId);
            if (fromList?.id) {
              return { id: fromList.id, name: fromList.name };
            }
            if (task.vendor?.id === draftVendorId) {
              return { id: task.vendor.id, name: task.vendor.name };
            }
            return null;
          })()
        : null;

      const sanitizedIndicator = normalizeStatusIndicatorValue(draftIndicator);

      return {
        title: draftTitle,
        description: draftDescription,
        dueDate: draftDueDate || undefined,
        dueTime: draftDueTime || undefined,
        properties: resolvedProperties,
        vendor: resolvedVendor,
        attachments: draftAttachments,
        tags: mergeIndicatorIntoTags(task.tags, sanitizedIndicator),
      } satisfies Partial<TaskDto>;
    },
    [properties, vendors, task]
  );

  useEffect(() => {
    const indicator = normalizeStatusIndicatorValue(
      deriveIndicatorForTask({
        status: task.status,
        tags: task.tags,
      })
    );
    const baseState = {
      title: task.title,
      description: task.description ?? "",
      dueDate: task.dueDate ?? "",
      dueTime: task.dueTime ?? "",
      selectedProps: task.properties.map((p) => p.id),
      vendorId: task.vendor?.id ?? "",
      attachments: task.attachments ?? [],
      statusIndicator: indicator,
    } as const;

    initialPayloadRef.current = JSON.stringify(createPayload(baseState));

    setTitle(baseState.title);
    setDescription(baseState.description);
    setDueDate(baseState.dueDate);
    setDueTime(baseState.dueTime);
    setSelectedProps(baseState.selectedProps);
    setVendorId(baseState.vendorId);
    setAttachments(baseState.attachments);
    setStatusIndicator(baseState.statusIndicator);
  }, [task, createPayload]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setAttachments((a) => [...(a ?? []), ...arr]);
  };

  const persistChanges = useCallback(
    (force = false) => {
      const payload = createPayload({
        title,
        description,
        dueDate,
        dueTime,
      selectedProps,
      vendorId,
      attachments,
      statusIndicator: normalizeStatusIndicatorValue(statusIndicator),
    });

      const serialized = JSON.stringify(payload);
      if (!force && serialized === initialPayloadRef.current) {
        return;
      }

      initialPayloadRef.current = serialized;
      onSave(payload);
    },
    [
      attachments,
      createPayload,
      description,
      dueDate,
      dueTime,
      onSave,
      selectedProps,
      statusIndicator,
      title,
      vendorId,
    ]
  );

  const handleSave = () => {
    persistChanges(true);
  };

  const handleClose = () => {
    persistChanges();
    onClose();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      if (menuButtonRef.current?.contains(target)) {
        return;
      }

      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [menuOpen]);

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
          ref={menuButtonRef}
          className="absolute right-2 top-2 text-xl"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-2 top-8 rounded-md border bg-white shadow dark:bg-gray-700"
          >
            <button
              onClick={() => {
                persistChanges();
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
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm dark:text-gray-200">
              Status label
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={statusIndicator.label}
              onChange={(e) =>
                updateStatusIndicator({ label: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm dark:text-gray-200">
              Status colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-transparent p-1 dark:border-gray-600"
                value={statusIndicator.color}
                onChange={(e) =>
                  updateStatusIndicator({ color: e.target.value })
                }
                aria-label="Choose status colour"
              />
              <input
                type="text"
                className="flex-1 rounded-md border border-gray-300 p-2 font-mono text-sm uppercase tracking-wide dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={statusIndicator.color}
                onChange={(e) =>
                  updateStatusIndicator({ color: e.target.value })
                }
                placeholder="#3b82f6"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Provide any hex colour code or pick from the presets.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUS_INDICATOR_PRESETS.map((preset) => {
                const isActive =
                  preset.color === statusIndicator.color &&
                  preset.label === statusIndicator.label;
                return (
                  <button
                    key={`${preset.label}-${preset.color}`}
                    type="button"
                    className={`flex items-center gap-2 rounded border px-2 py-1 text-xs transition ${
                      isActive
                        ? "border-gray-900 bg-gray-100 dark:border-gray-100 dark:bg-gray-800"
                        : "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                    }`}
                    onClick={() =>
                      updateStatusIndicator({
                        label: preset.label,
                        color: preset.color,
                      })
                    }
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: preset.color }}
                      aria-hidden
                    />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
