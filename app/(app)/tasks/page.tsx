"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import TasksKanban from "../../../components/tasks/TasksKanban";
import TasksCalendar from "../../../components/tasks/TasksCalendar";
import TasksGantt from "../../../components/tasks/TasksGantt";
import TaskList from "../../../components/tasks/TaskList";
import TasksSkeleton from "../../../components/skeletons/TasksSkeleton";
import { listTasks } from "../../../lib/api";
import type { TaskDto } from "../../../types/tasks";

const VIEW_OPTIONS = [
  { id: "board", label: "Board" },
  { id: "calendar", label: "Calendar" },
  { id: "gantt", label: "Gantt" },
  { id: "list", label: "List" },
] as const;

type ViewId = (typeof VIEW_OPTIONS)[number]["id"];

const DEFAULT_TASK_QUERY_KEY = ["tasks", { propertyId: null }] as const;

export default function TasksPage() {
  const [view, setView] = useState<ViewId>("board");

  const shouldLoadTasks = view === "calendar" || view === "gantt";

  const { data: tasks = [], isLoading } = useQuery<TaskDto[]>({
    queryKey: DEFAULT_TASK_QUERY_KEY,
    queryFn: () => listTasks(),
    enabled: shouldLoadTasks,
  });

  const viewContent = useMemo(() => {
    if (view === "board") {
      return <TasksKanban />;
    }

    if (view === "calendar") {
      if (isLoading) return <TasksSkeleton />;
      return <TasksCalendar tasks={tasks} />;
    }

    if (view === "gantt") {
      if (isLoading) return <TasksSkeleton />;
      return <TasksGantt tasks={tasks} />;
    }

    return <TaskList />;
  }, [isLoading, tasks, view]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Tasks</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor work across your portfolio and coordinate your team.
          </p>
        </div>
        <Link
          href="/tasks/archive"
          className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          View archive
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {VIEW_OPTIONS.map((option) => {
          const isActive = option.id === view;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                isActive
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <section className="min-h-[400px]">
        {viewContent}
      </section>
    </div>
  );
}
