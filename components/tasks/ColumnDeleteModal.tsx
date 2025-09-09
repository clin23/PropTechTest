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
      <div className="w-80 space-y-2 rounded bg-white p-4 dark:bg-gray-800 dark:text-white">
        <h2 className="text-lg font-medium">Delete List</h2>
        <p className="text-sm dark:text-gray-300">
          Type "{column.title}" to confirm deleting this list.
        </p>
        <input
          className="w-full rounded border p-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-2 py-1 bg-gray-100 dark:bg-gray-600 dark:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={!canDelete}
            className={`px-2 py-1 text-white ${
              canDelete
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-red-300 dark:bg-red-300"
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

