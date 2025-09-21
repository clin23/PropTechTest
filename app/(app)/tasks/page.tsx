"use client";

import { useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import TasksKanban, {
  type TasksKanbanContext,
} from "../../../components/tasks/TasksKanban";
import Clock from "../../../components/Clock";
import TasksSkeleton from "../../../components/skeletons/TasksSkeleton";

export default function TasksPage() {
  const [activeProperty, setActiveProperty] =
    useState<TasksKanbanContext | null>(null);
  const title = activeProperty ? `Tasks: ${activeProperty.address}` : "Tasks";
  const pendingCount = useIsFetching({
    predicate: (query) => {
      const [key] = query.queryKey;
      if (typeof key !== "string") {
        return false;
      }
      if (key !== "tasks" && key !== "properties") {
        return false;
      }
      return query.state.status === "pending";
    },
  });
  const isLoading = pendingCount > 0;

  return (
    <div className="relative">
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-white/90 backdrop-blur-sm dark:bg-gray-950/70">
          <TasksSkeleton />
        </div>
      )}
      <div
        className={`p-6 space-y-4 transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <Clock className="text-2xl font-semibold" />
        </header>
        <TasksKanban onContextChange={setActiveProperty} />
      </div>
    </div>
  );
}
