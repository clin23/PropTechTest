"use client";
import React from "react";
import type { TaskDto } from "../../types/tasks";

export default function TaskCard({
  task,
  onClick,
}: {
  task: TaskDto;
  onClick?: () => void;
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
  return (
    <div
      className={`border rounded p-2 ${
        onClick ? "cursor-pointer" : ""
      } ${dueSoon ? "border-yellow-500" : ""}`}
      onClick={onClick}
    >
      <div className="font-medium">{task.title}</div>
      <div className="mt-1 space-y-1 text-xs">
        {task.vendor && <div>Vendor: {task.vendor.name}</div>}
        {task.properties.map((p) => (
          <div key={p.id}>{p.address}</div>
        ))}
        {task.attachments?.length ? (
          <div>📎 {task.attachments.length}</div>
        ) : null}
        {task.dueDate && (
          <div className={dueSoon ? "text-red-600" : ""}>
            Due {task.dueDate}
            {dueSoon && <span className="ml-1">⚠️</span>}
          </div>
        )}
      </div>
    </div>
  );
}
