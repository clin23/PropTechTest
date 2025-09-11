"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTasks, unarchiveTask, bulkTasks } from "../../lib/api";
import type { TaskDto } from "../../types/tasks";
import TaskCard from "./TaskCard";
import TaskRecoverModal from "./TaskRecoverModal";

export default function TasksArchive() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: tasks = [] } = useQuery<TaskDto[]>({
    queryKey: ["tasks", "archive", { q, from, to }],
    queryFn: () =>
      listTasks({
        archived: true,
        q: q || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });

  const recoverMut = useMutation({
    mutationFn: (id: string) => unarchiveTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", "archive"] }),
  });

  const deleteAllMut = useMutation({
    mutationFn: (ids: string[]) => bulkTasks({ ids, op: "delete" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", "archive"] }),
  });

  const [selected, setSelected] = useState<TaskDto | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canDeleteAll = confirmText === "delete all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="flex-1 rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Search Task"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex flex-col">
          <label className="text-sm">From</label>
          <input
            type="date"
            className="rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">To</label>
          <input
            type="date"
            className="rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button
          className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
          onClick={() => setConfirmOpen(true)}
        >
          Delete All
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onClick={() => setSelected(t)} />
        ))}
      </div>
      {selected && (
        <TaskRecoverModal
          task={selected}
          onClose={() => setSelected(null)}
          onRecover={() => {
            recoverMut.mutate(selected.id);
            setSelected(null);
          }}
        />
      )}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-80 space-y-2 rounded bg-white p-4 dark:bg-gray-800 dark:text-white">
            <h2 className="text-lg font-medium">Delete All Tasks</h2>
            <p className="text-sm dark:text-gray-300">
              Type "delete all" to confirm deleting all archived tasks.
            </p>
            <input
              className="w-full rounded border p-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-2 py-1 bg-gray-100 dark:bg-gray-600 dark:text-white"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
              >
                Cancel
              </button>
              <button
                disabled={!canDeleteAll}
                className={`px-2 py-1 text-white ${
                  canDeleteAll
                    ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    : "bg-red-300 dark:bg-red-300"
                }`}
                onClick={() => {
                  if (!canDeleteAll) return;
                  deleteAllMut.mutate(tasks.map((t) => t.id));
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
