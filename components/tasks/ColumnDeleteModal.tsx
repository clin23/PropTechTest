"use client";
import { useState, useEffect } from "react";

type Column = { id: string; title: string };

export default function ColumnDeleteModal({
  column,
  onClose,
  onConfirm,
}: {
  column: Column;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName("");
  }, [column]);

  const canDelete = name === column.title;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-80 space-y-2">
        <h2 className="text-lg font-medium">Delete List</h2>
        <p className="text-sm">
          Type "{column.title}" to confirm deleting this list.
        </p>
        <input
          className="w-full rounded border p-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-2 py-1 bg-gray-100" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={!canDelete}
            className={`px-2 py-1 text-white ${
              canDelete ? "bg-red-500" : "bg-red-300"
            }`}
            onClick={() => {
              if (!canDelete) return;
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

