"use client";
import { useState, useEffect } from "react";
import type { TaskDto } from "../../types/tasks";

export default function TaskEditModal({
  task,
  onClose,
  onSave,
}: {
  task: TaskDto;
  onClose: () => void;
  onSave: (data: Partial<TaskDto>) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setDueDate(task.dueDate ?? "");
  }, [task]);

  const handleSave = () => {
    onSave({
      title,
      description,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded bg-white p-4 shadow dark:bg-gray-800 space-y-2">
        <h2 className="text-lg font-semibold">Edit Task</h2>
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
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-2 py-1 text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-2 py-1 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
