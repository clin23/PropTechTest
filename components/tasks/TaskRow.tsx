"use client";
import { useState } from "react";
import PropertyBadge from "../PropertyBadge";
import type { TaskDto } from "../../types/tasks";

export default function TaskRow({
  task,
  onUpdate,
  onDelete,
  onToggle,
}: {
  task: TaskDto;
  onUpdate: (data: Partial<TaskDto>) => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const handleBlur = () => {
    if (title !== task.title) onUpdate({ title });
  };
  return (
    <div className="flex items-start gap-2 p-2 border rounded">
      <input
        type="checkbox"
        checked={task.status === "done"}
        onChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1">
        <input
          className="w-full bg-transparent outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {task.properties.map((p) => (
            <PropertyBadge key={p.id} address={p.address} />
          ))}
        </div>
      </div>
      <button onClick={onDelete} className="text-xs text-red-500">
        ✕
      </button>
    </div>
  );
}
