"use client";
import { useState } from "react";

export default function ColumnCreateModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-80 space-y-2">
        <h2 className="text-lg font-medium">New List</h2>
        <input
          className="w-full rounded border p-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-2 py-1 bg-gray-100" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-2 py-1 bg-blue-500 text-white"
            onClick={() => {
              if (!title.trim()) return;
              onSave(title);
              setTitle("");
              onClose();
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

