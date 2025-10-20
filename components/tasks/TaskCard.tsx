"use client";
import { useEffect, useState } from "react";
import type { TaskDto } from "../../types/tasks";
import {
  deriveIndicatorForTask,
  getIndicatorPresentation,
} from "./statusIndicator";

const STATUS_PILL_CLASSES = [
  "inline-flex w-4 min-h-[2.5rem] max-h-[4.25rem]",
  "items-center justify-center rounded-full border border-white/30",
  "px-0.5 text-[7px] font-semibold uppercase tracking-[0.08em]",
  "leading-none bg-opacity-90 text-center",
].join(" ");

const resolveColorFromValue = (value: string): string | null => {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const directHex = normalized.match(/^#([0-9a-f]{6})$/i);
  if (directHex) {
    return `#${directHex[1].toLowerCase()}`;
  }

  const variableMatch = normalized.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (!variableMatch) {
    return null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const propertyName = variableMatch[1];
  const root = document.documentElement;
  const computedValue = getComputedStyle(root).getPropertyValue(propertyName);
  if (computedValue.trim()) {
    return computedValue.trim();
  }

  const inlineValue = root.style.getPropertyValue(propertyName);
  if (inlineValue.trim()) {
    return inlineValue.trim();
  }

  return null;
};

const getStatusPillForeground = (background: string): string => {
  const resolvedColor = resolveColorFromValue(background);
  if (!resolvedColor) {
    return "#ffffff";
  }

  const hexMatch = resolvedColor.match(/^#([0-9a-f]{6})$/i);
  if (!hexMatch) {
    return "#ffffff";
  }

  const hex = hexMatch[1];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.6 ? "#111827" : "#ffffff";
};

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
    completed: task.completed,
  });
  const statusInfo = getIndicatorPresentation(indicatorValue);

  const pillLabel = statusInfo?.label ?? "";
  const pillBackground = statusInfo?.color ?? "";
  const [pillTextColor, setPillTextColor] = useState(() =>
    getStatusPillForeground(pillBackground)
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateColor = () => {
      const nextColor = getStatusPillForeground(pillBackground);
      setPillTextColor((previous) =>
        previous === nextColor ? previous : nextColor
      );
    };

    updateColor();

    const root = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (mutation) =>
            mutation.type === "attributes" && mutation.attributeName === "data-theme"
        )
      ) {
        updateColor();
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [pillBackground]);

  return (
    <div
      className={`group relative flex flex-col rounded border p-2 ${
        onClick ? "cursor-pointer" : ""
      } ${borderColorClass}`}
      onClick={onClick}
    >
      {statusInfo && (
        <span className="absolute right-2 top-2 flex items-start">
          <span className="sr-only">Status: {pillLabel}</span>
          <span
            aria-hidden
            className={STATUS_PILL_CLASSES}
            style={{
              backgroundColor: pillBackground,
              color: pillTextColor,
              writingMode: "vertical-rl",
              textOrientation: "upright",
              whiteSpace: "nowrap",
            }}
          >
            {pillLabel}
          </span>
        </span>
      )}
      <div className="flex items-start gap-2">
        <div className={`font-medium ${statusInfo ? "pr-12" : ""}`}>
          {task.title}
        </div>
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
      {!completed && onComplete && (
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
            {isCompleting ? "Completing…" : "Complete Task"}
          </button>
        </div>
      )}
    </div>
  );
}
