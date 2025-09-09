"use client";
import { useState } from "react";
import PropertyBadge from "../PropertyBadge";
import type { TaskDto } from "../../types/tasks";
import type { PropertySummary } from "../../types/property";

export default function TaskRow({
  task,
  properties,
  onUpdate,
  onDelete,
  onToggle,
}: {
  task: TaskDto;
  properties: PropertySummary[];
  onUpdate: (data: Partial<TaskDto>) => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [cadence, setCadence] = useState<TaskDto["cadence"]>(task.cadence);
  const [selectedProps, setSelectedProps] = useState<string[]>(
    task.properties.map((p) => p.id)
  );
  type RecurrenceFreq =
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY"
    | "YEARLY"
    | "CUSTOM"
    | null;
  const [freq, setFreq] = useState<RecurrenceFreq>(task.recurrence?.freq ?? null);

  const handleBlur = () => {
    if (title !== task.title) onUpdate({ title });
  };

  const startEdit = () => {
    setDescription(task.description ?? "");
    setDueDate(task.dueDate ?? "");
    setCadence(task.cadence);
    setSelectedProps(task.properties.map((p) => p.id));
    setFreq(task.recurrence?.freq ?? null);
    setEditing(true);
  };

  const handleSave = () => {
    const props = selectedProps
      .map((id) => properties.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, address: p!.address }));
    onUpdate({
      title,
      description,
      dueDate: dueDate || undefined,
      cadence,
      properties: props,
      recurrence: { freq },
    });
    setEditing(false);
  };

  const dueSoon = (() => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 1 && diff >= 0;
  })();
  const dueTomorrow = (() => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff =
      (startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24);
    return diff === 1;
  })();

  return (
    <div className="flex flex-col gap-2 p-2 border rounded">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.status === "done"}
          onChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1">
          <input
            className="w-full bg-transparent outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {task.properties.map((p) => (
              <PropertyBadge key={p.id} address={p.address} />
            ))}
            {task.dueDate && (
              <span
                className={`text-xs ${
                  dueSoon ? "text-red-600" : "text-gray-500"
                }`}
              >
                {dueTomorrow ? `Due tomorrow!` : `Due ${task.dueDate}`}
                {dueSoon && <span className="ml-1">⚠️</span>}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={startEdit}
            className="text-xs text-blue-500 hover:underline"
          >
            Edit
          </button>
          <button onClick={onDelete} className="text-xs text-red-500">
            ✕
          </button>
        </div>
      </div>
      {editing && (
        <div className="space-y-2 pl-6">
          <textarea
            className="w-full border rounded p-1 text-sm"
            placeholder="Notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 text-sm">
            <label className="flex items-center gap-1">
              Due
              <input
                type="date"
                className="border rounded p-1"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-1">
              Cadence
              <select
                className="border rounded p-1"
                value={cadence}
                onChange={(e) => setCadence(e.target.value as TaskDto["cadence"])}
              >
                <option value="Immediate">Immediate</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Custom">Custom</option>
              </select>
            </label>
            <label className="flex items-center gap-1">
              Repeat
              <select
                className="border rounded p-1"
                value={freq ?? ""}
                onChange={(e) =>
                  setFreq(e.target.value ? (e.target.value as any) : null)
                }
              >
                <option value="">None</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </label>
          </div>
          <div className="text-sm">
            <label className="block mb-1">Properties</label>
            <select
              multiple
              className="w-full border rounded p-1"
              value={selectedProps}
              onChange={(e) =>
                setSelectedProps(
                  Array.from(e.target.selectedOptions).map((o) => o.value)
                )
              }
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 text-sm">
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2 py-1 text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
