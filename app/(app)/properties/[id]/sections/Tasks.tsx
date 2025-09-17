"use client";

import { useState } from "react";
import TasksKanban from "../../../../../components/tasks/TasksKanban";

type PropertyContext = { id: string; address: string };

interface TasksProps {
  propertyId: string;
  propertyAddress: string;
}

export default function Tasks({ propertyId, propertyAddress }: TasksProps) {
  const [activeProperty, setActiveProperty] = useState<PropertyContext>({
    id: propertyId,
    address: propertyAddress,
  });

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Tasks{activeProperty ? `: ${activeProperty.address}` : ""}
        </h2>
      </header>
      <TasksKanban
        initialPropertyId={propertyId}
        allowPropertySwitching={false}
        onContextChange={setActiveProperty}
      />
    </div>
  );
}
