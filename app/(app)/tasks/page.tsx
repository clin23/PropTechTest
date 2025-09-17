"use client";

import { useState } from "react";
import TasksKanban from "../../../components/tasks/TasksKanban";
import Clock from "../../../components/Clock";

type PropertyContext = { id: string; address: string };

export default function TasksPage() {
  const [activeProperty, setActiveProperty] =
    useState<PropertyContext | null>(null);

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Tasks{activeProperty ? `: ${activeProperty.address}` : ""}
        </h1>
        <Clock className="text-2xl font-semibold" />
      </header>
      <TasksKanban onContextChange={setActiveProperty} />
    </div>
  );
}
