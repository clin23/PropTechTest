"use client";
import React from "react";
import type { TaskDto } from "../../types/tasks";
import {
  deriveIndicatorForTask,
  getIndicatorPresentation,
} from "./statusIndicator";

export default function TaskCard({
  task,
  onClick,
  showProperties = true,
  onComplete,
  isCompleted,
  isCompleting = false,
}: {
  task: TaskDto;
  onClick?: () => void;
  showProperties?: boolean;
  onComplete?: () => void | Promise<void>;
  isCompleted?: boolean;
  isCompleting?: boolean;
}) {
  const REMINDER_DAYS = Number(
    process.env.NEXT_PUBLIC_TASK_REMINDER_DAYS ?? 1
  );
  const dueSoon = (() => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= REMINDER_DAYS && diff >= 0;
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
  const completed =
    typeof isCompleted === "boolean"
      ? isCompleted
      : Boolean(task.completed);
  const borderColorClass = completed
    ? "border-green-500"
    : dueSoon
      ? "border-yellow-500"
      : "";
  const indicatorValue = deriveIndicatorForTask({
    status: task.status,
    tags: task.tags,
  });
  const statusInfo = getIndicatorPresentation(indicatorValue);

  const completionButtonLabel = isCompleting
    ? completed
      ? "Updating…"
      : "Completing…"
    : completed
      ? "Mark incomplete"
      : "Complete Task";

  return (
    <div
      className={`group relative flex flex-col rounded border p-2 ${
        onClick ? "cursor-pointer" : ""
      } ${borderColorClass}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{task.title}</div>
        {statusInfo && (
          <span className="inline-flex h-2.5 w-2.5 items-center justify-center">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
              aria-hidden
            />
            <span className="sr-only">{statusInfo.label}</span>
          </span>
        )}
      </div>
      <div className="mt-2 space-y-1 text-xs">
        {task.vendor && <div>Vendor: {task.vendor.name}</div>}
        {showProperties &&
          task.properties.map((p) => (
            <div key={p.id}>{p.address}</div>
          ))}
        {task.attachments?.length ? (
          <div>📎 {task.attachments.length}</div>
        ) : null}
        {task.dueDate && (
          <div className={dueSoon ? "text-red-600" : ""}>
            {dueTomorrow
              ? `Due tomorrow!`
              : `Due ${task.dueDate}${task.dueTime ? ` ${task.dueTime}` : ""}`}
            {dueSoon && <span className="ml-1">⚠️</span>}
          </div>
        )}
      </div>
      {onComplete && (
        <div
          className="max-h-0 overflow-hidden pt-0 transition-all duration-300 ease-in-out group-focus-within:max-h-16 group-focus-within:pt-2 group-hover:max-h-16 group-hover:pt-2"
        >
          <button
            type="button"
            className="w-full rounded bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity duration-300 ease-in-out hover:bg-gray-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 group-focus-within:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-gray-500 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus-visible:ring-gray-500"
            onClick={(event) => {
              event.stopPropagation();
              if (isCompleting) return;
              void Promise.resolve(onComplete()).catch((error) => {
                console.error("Failed to complete task", error);
              });
            }}
            disabled={isCompleting}
          >
            {completionButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
