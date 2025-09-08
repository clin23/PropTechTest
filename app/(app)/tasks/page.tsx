"use client";

import TaskList from "../../../components/tasks/TaskList";

export default function TasksPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <TaskList />
    </div>
  );
}
