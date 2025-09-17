"use client";

import { useState } from "react";
import TasksKanban, {
  type TasksKanbanContext,
} from "../../../components/tasks/TasksKanban";
import Clock from "../../../components/Clock";

export default function TasksPage() {
  const [activeProperty, setActiveProperty] =
    useState<TasksKanbanContext | null>(null);
  const title = activeProperty ? `Tasks: ${activeProperty.address}` : "Tasks";

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Clock className="text-2xl font-semibold" />
      </header>
      <TasksKanban onContextChange={setActiveProperty} />
    </div>
  );
}
