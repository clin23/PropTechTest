"use client";

import TasksKanban from "../../../components/tasks/TasksKanban";
import Clock from "../../../components/Clock";

export default function TasksPage() {
  return (
    <div className="p-6 space-y-4 relative">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <div className="absolute top-6 right-6">
        <Clock />
      </div>
      <TasksKanban />
    </div>
  );
}
