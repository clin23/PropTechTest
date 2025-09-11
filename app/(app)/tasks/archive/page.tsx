"use client";

import TasksArchive from "../../../../components/tasks/TasksArchive";
import Clock from "../../../../components/Clock";
import Link from "next/link";

export default function TaskArchivePage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tasks"
            className="border rounded px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold">Task Archive</h1>
        </div>
        <Clock className="text-2xl font-semibold" />
      </div>
      <TasksArchive />
    </div>
  );
}
