"use client";

import TasksKanban from "../../../components/tasks/TasksKanban";

export default function TasksPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <TasksKanban />
    </div>
  );
}
