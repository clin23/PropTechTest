"use client";

import TasksArchive from "../../../../components/tasks/TasksArchive";
import Clock from "../../../../components/Clock";

export default function TaskArchivePage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Task Archive</h1>
        <Clock className="text-2xl font-semibold" />
      </div>
      <TasksArchive />
    </div>
  );
}
