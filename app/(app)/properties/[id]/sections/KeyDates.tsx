"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import KeyDateFormModal, {
  type KeyDateFormValues,
} from "../../../../../components/KeyDateFormModal";
import Skeleton from "../../../../../components/Skeleton";
import {
  createReminder,
  deleteReminder,
  listReminders,
  updateReminder,
  type Reminder,
} from "../../../../../lib/api";

interface KeyDatesProps {
  propertyId: string;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return dateFormatter.format(parsed);
}

function severityStyle(severity: Reminder["severity"]) {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    case "med":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    default:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  }
}

export default function KeyDates({ propertyId }: KeyDatesProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["reminders", propertyId],
    queryFn: () => listReminders({ propertyId }),
  });

  const taskNoticeTimers = useRef<{ hide: number | null; remove: number | null }>({
    hide: null,
    remove: null,
  });
  const [taskNotification, setTaskNotification] = useState<
    | {
        message: string;
        isVisible: boolean;
      }
    | null
  >(null);

  const showTaskNotification = (reminder: Reminder) => {
    if (!reminder.taskId) return;
    const propertyLabel = reminder.propertyAddress?.trim() || "this property";
    setTaskNotification({
      message: `We've whisked the linked tasks for ${propertyLabel} into your board.`,
      isVisible: true,
    });
  };

  useEffect(() => {
    return () => {
      if (taskNoticeTimers.current.hide) {
        window.clearTimeout(taskNoticeTimers.current.hide);
        taskNoticeTimers.current.hide = null;
      }
      if (taskNoticeTimers.current.remove) {
        window.clearTimeout(taskNoticeTimers.current.remove);
        taskNoticeTimers.current.remove = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!taskNotification?.isVisible) return;

    if (taskNoticeTimers.current.hide) {
      window.clearTimeout(taskNoticeTimers.current.hide);
      taskNoticeTimers.current.hide = null;
    }
    if (taskNoticeTimers.current.remove) {
      window.clearTimeout(taskNoticeTimers.current.remove);
      taskNoticeTimers.current.remove = null;
    }

    taskNoticeTimers.current.hide = window.setTimeout(() => {
      setTaskNotification((prev) => (prev ? { ...prev, isVisible: false } : prev));
    }, 3200);

    taskNoticeTimers.current.remove = window.setTimeout(() => {
      setTaskNotification(null);
    }, 3800);
  }, [taskNotification]);

  const invalidateRelated = () => {
    void queryClient.invalidateQueries({ queryKey: ["reminders", propertyId] });
    void queryClient.invalidateQueries({ queryKey: ["reminders"] });
    void queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    void queryClient.invalidateQueries({ queryKey: ["properties"] });
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const [firstKey] = query.queryKey;
        return firstKey === "tasks";
      },
    });
  };

  const createMutation = useMutation({
    mutationFn: (values: KeyDateFormValues) => createReminder(values),
    onSuccess: (reminder) => {
      if (reminder.taskId) {
        showTaskNotification(reminder);
      }
      invalidateRelated();
      setModalOpen(false);
      setEditingReminder(null);
      setError(null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to save key date.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: KeyDateFormValues }) =>
      updateReminder(id, values),
    onSuccess: (reminder) => {
      const hadLinkedTask = Boolean(editingReminder?.taskId);
      if (!hadLinkedTask && reminder.taskId) {
        showTaskNotification(reminder);
      }
      invalidateRelated();
      setModalOpen(false);
      setEditingReminder(null);
      setError(null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to save key date.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => {
      invalidateRelated();
      setModalOpen(false);
      setEditingReminder(null);
      setError(null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to delete key date.");
    },
  });

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
        return a.title.localeCompare(b.title);
      }
      if (aTime === bTime) {
        return a.title.localeCompare(b.title);
      }
      return aTime - bTime;
    });
  }, [reminders]);

  const handleSubmit = (values: KeyDateFormValues) => {
    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = () => {
    if (!editingReminder) return;
    deleteMutation.mutate(editingReminder.id);
  };

  const handleCreateClick = () => {
    setEditingReminder(null);
    setError(null);
    setModalOpen(true);
  };

  const handleItemClick = (item: Reminder) => {
    setEditingReminder(item);
    setError(null);
    setModalOpen(true);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      {taskNotification && (
        <div
          className={`pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-300 ease-out ${
            taskNotification.isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm text-blue-900 shadow-lg backdrop-blur dark:border-blue-500/40 dark:bg-blue-950/80 dark:text-blue-100">
            <p className="font-semibold">Linked tasks ready</p>
            <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-200/80">
              {taskNotification.message}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Key Dates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track compliance, renewals, and reminders for this property.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          onClick={handleCreateClick}
        >
          + Add key date
        </button>
      </div>
      <div className="space-y-3" data-testid="key-dates-list">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : sortedReminders.length === 0 ? (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No key dates yet. Create your first reminder to stay ahead of critical events.
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedReminders.map((reminder) => (
              <li key={reminder.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => handleItemClick(reminder)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {reminder.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(reminder.dueDate)}
                        {reminder.dueTime ? ` · ${reminder.dueTime}` : ""}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityStyle(
                        reminder.severity,
                      )}`}
                    >
                      {reminder.severity === "high"
                        ? "High"
                        : reminder.severity === "med"
                        ? "Medium"
                        : "Low"}
                    </span>
                  </div>
                  {reminder.recurrence && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Recurs: {reminder.recurrence}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {reminder.documents?.length ? (
                      <span>📎 {reminder.documents.length} document{reminder.documents.length === 1 ? "" : "s"}</span>
                    ) : null}
                    {reminder.checklist?.length ? (
                      <span>✔️ {reminder.checklist.length} checklist item{reminder.checklist.length === 1 ? "" : "s"}</span>
                    ) : null}
                    {reminder.taskId ? <span>🔗 Linked to tasks</span> : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <KeyDateFormModal
        open={isModalOpen}
        propertyId={propertyId}
        initialData={editingReminder}
        onSubmit={handleSubmit}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setEditingReminder(null);
        }}
        onDelete={editingReminder ? handleDelete : undefined}
        isSaving={saving}
        isDeleting={deleteMutation.isPending}
        error={error}
      />
    </div>
  );
}
