"use client";
import { useState, useEffect } from "react";

export default function ConfirmDeleteModal({
  onClose,
  onConfirm,
  word = "delete",
}: {
  onClose: () => void;
  onConfirm: () => void;
  word?: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
  }, [word]);

  const canDelete = value === word;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="w-80 space-y-2 rounded bg-white p-4 dark:bg-gray-800 dark:text-white">
        <h2 className="text-lg font-medium">Delete</h2>
        <p className="text-sm dark:text-gray-300">
          Type "{word}" to confirm deleting this item.
        </p>
        <input
          className="w-full rounded border p-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
