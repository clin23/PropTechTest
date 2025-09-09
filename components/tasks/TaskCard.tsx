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
  return (
    <div
      className={`border rounded p-2 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="font-medium">{task.title}</div>
    </div>
  );
}
