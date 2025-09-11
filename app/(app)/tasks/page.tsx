"use client";

import TasksKanban from "../../../components/tasks/TasksKanban";
import Clock from "../../../components/Clock";
import Link from "next/link";

export default function TasksPage() {
  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Clock className="text-2xl font-semibold" />
      </header>
      <TasksKanban />
    </div>
  );
}
