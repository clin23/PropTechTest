"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTasks, createTask, updateTask, deleteTask, completeTask, listProperties } from "../../lib/api";
import type { TaskDto } from "../../types/tasks";
import TaskRow from "./TaskRow";
import TaskQuickNew from "./TaskQuickNew";

export default function TaskList() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useQuery<TaskDto[]>({
    queryKey: ["tasks"],
    queryFn: () => listTasks(),
  });
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => listProperties(),
  });
  const defaultProp = properties[0];

  const createMut = useMutation({
    mutationFn: (title: string) =>
      createTask({ title, properties: defaultProp ? [{ id: defaultProp.id, address: defaultProp.address }] : [] }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskDto> }) => updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const completeMut = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <div className="space-y-2">
      <TaskQuickNew onCreate={(title) => createMut.mutate(title)} />
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          properties={properties}
          onUpdate={(data) => updateMut.mutate({ id: t.id, data })}
          onDelete={() => deleteMut.mutate(t.id)}
          onToggle={() => completeMut.mutate(t.id)}
        />
      ))}
    </div>
  );
}
