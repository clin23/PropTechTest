"use client";
import React from "react";
import type { TaskDto } from "../../types/tasks";

export default function TasksGantt({ tasks }: { tasks: TaskDto[] }) {
  return <div>Gantt view ({tasks.length} tasks)</div>;
}
