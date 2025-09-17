"use client";

import TasksKanban from "../../../../../components/tasks/TasksKanban";

interface PropertyTasksProps {
  propertyId: string;
  propertyAddress: string;
}

export default function PropertyTasks({
  propertyId,
  propertyAddress,
}: PropertyTasksProps) {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Tasks: {propertyAddress}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tasks created in this view are automatically linked to this property.
        </p>
      </header>
      <TasksKanban initialPropertyId={propertyId} allowPropertySwitching={false} />
    </div>
  );
}
