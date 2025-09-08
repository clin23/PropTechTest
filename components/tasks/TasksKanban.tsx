"use client";
import React from "react";
import type { TaskDto } from "../../types/tasks";
import TaskCard from "./TaskCard";

export default function TasksKanban({ tasks }: { tasks: TaskDto[] }) {
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  );
}
