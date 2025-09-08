"use client";
import React from "react";
import type { TaskDto } from "../../types/tasks";

export default function TasksCalendar({ tasks }: { tasks: TaskDto[] }) {
  return <div>Calendar view ({tasks.length} tasks)</div>;
}
