"use client";

import { useQuery } from "@tanstack/react-query";
import { listTasks } from "../../../../lib/api";
import type { TaskDto } from "../../../../types/tasks";

export default function TasksPage() {
  const { data: tasks = [] } = useQuery<TaskDto[]>({
    queryKey: ["tasks"],
    queryFn: () => listTasks(),
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <ul className="list-disc pl-6">
        {tasks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}
