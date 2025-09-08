"use client";
import React from "react";
import type { TaskDto } from "../../types/tasks";

export default function TaskCard({ task }: { task: TaskDto }) {
  return (
    <div className="border rounded p-2">
      <div className="font-medium">{task.title}</div>
    </div>
  );
}
