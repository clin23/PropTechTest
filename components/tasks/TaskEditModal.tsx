"use client";
import { useState, useEffect } from "react";
import type { TaskDto } from "../../types/tasks";
import type { PropertySummary } from "../../types/property";
import type { Vendor } from "../../lib/api";

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
  const [selectedProps, setSelectedProps] = useState<string[]>(
    task.properties.map((p) => p.id)
  );
  const [vendorId, setVendorId] = useState<string>(task.vendor?.id ?? "");
  const [attachments, setAttachments] = useState<
    TaskDto["attachments"]
  >(task.attachments ?? []);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setDueDate(task.dueDate ?? "");
    setSelectedProps(task.properties.map((p) => p.id));
    setVendorId(task.vendor?.id ?? "");
    setAttachments(task.attachments ?? []);
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
    onSave({
      title,
      description,
      dueDate: dueDate || undefined,
      properties: props,
      vendor: vendor ? { id: vendor.id!, name: vendor.name } : null,
      attachments,
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
        className="relative w-80 rounded bg-white p-4 shadow dark:bg-gray-800 space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-2 top-2 text-xl"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div className="absolute right-2 top-8 rounded border bg-white shadow">
            <button
              onClick={() => {
                handleSave();
                onArchive();
              }}
              className="block px-4 py-2 text-left text-sm w-full hover:bg-gray-100"
            >
              Archive
            </button>
          </div>
        )}
        <h2 className="text-lg font-semibold">Task Details</h2>
        <input
          className="w-full rounded border p-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded border p-1"
          placeholder="Notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="block text-sm">
          Due date
          <input
            type="date"
            className="w-full rounded border p-1"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <div>
          <label className="block text-sm mb-1">Property</label>
          <select
            className="w-full rounded border p-1"
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
          <label className="block text-sm mb-1">Vendor</label>
          <select
            className="w-full rounded border p-1"
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
          <label className="block text-sm mb-1">Attachments</label>
          <input
            type="file"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
          {attachments?.length ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {attachments.map((a) => (
                <li key={a.url}>{a.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
