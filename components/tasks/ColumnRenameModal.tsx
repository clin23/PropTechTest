"use client";
import { useState, useEffect } from "react";

type Column = { id: string; title: string };

export default function ColumnRenameModal({
  column,
  onClose,
  onSave,
}: {
  column: Column;
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(column.title);

  useEffect(() => {
    setTitle(column.title);
  }, [column]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-80 space-y-2">
        <h2 className="text-lg font-medium">Rename List</h2>
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
              onSave(title);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

