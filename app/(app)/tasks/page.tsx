"use client";

import TasksKanban from "../../../components/tasks/TasksKanban";
import Clock from "../../../components/Clock";
import Link from "next/link";

export default function TasksPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div className="flex items-center gap-4">
          <Link href="/tasks/archive" className="underline">
            Archive
          </Link>
          <Clock className="text-2xl font-semibold" />
        </div>
      </div>
      <TasksKanban />
    </div>
  );
}
