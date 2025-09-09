"use client";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTasks,
  createTask,
  updateTask,
  archiveTask,
  listProperties,
  listVendors,
} from "../../lib/api";
import type { TaskDto } from "../../types/tasks";
import TaskCard from "./TaskCard";
import TaskQuickNew from "./TaskQuickNew";
import TaskEditModal from "./TaskEditModal";

type Column = { id: string; title: string };

const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "ASAP" },
  { id: "in_progress", title: "Soon" },
  { id: "blocked", title: "Later" },
  { id: "done", title: "Done" },
];

const STORAGE_KEY = "task-columns";

export default function TasksKanban() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useQuery<TaskDto[]>({
    queryKey: ["tasks"],
    queryFn: () => listTasks(),
  });
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => listProperties(),
  });
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => listVendors(),
  });
  const defaultProp = properties[0];

  const createMut = useMutation({
    mutationFn: ({ title, status }: { title: string; status: string }) =>
      createTask({
        title,
        status,
        properties: defaultProp
          ? [{ id: defaultProp.id, address: defaultProp.address }]
          : [],
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskDto> }) =>
      updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const archiveMut = useMutation({
    mutationFn: (id: string) => archiveTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);


  const [columns, setColumns] = useState<Column[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setColumns(JSON.parse(stored));
    else setColumns(DEFAULT_COLUMNS);
  }, []);
  useEffect(() => {
    if (columns.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    updateMut.mutate({ id: draggableId, data: { status: destination.droppableId } });
  };

  const addColumn = () => {
    const title = prompt("Column name");
    if (!title) return;
    const id = title.toLowerCase().replace(/\s+/g, "_");
    setColumns([...columns, { id, title }]);
  };

  const renameColumn = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (!col) return;
    const title = prompt("New name", col.title);
    if (!title) return;
    setColumns(columns.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const deleteColumn = (id: string) => {
    if (!confirm("Delete column and move tasks to first column?")) return;
    const fallback = columns[0]?.id || "todo";
    setColumns(columns.filter((c) => c.id !== id));
    tasks
      .filter((t) => t.status === id)
      .forEach((t) =>
        updateMut.mutate({ id: t.id, data: { status: fallback } })
      );
  };

  return (<>
    <div className="flex gap-4 overflow-x-auto p-1">
      <DragDropContext onDragEnd={handleDragEnd}>
        {columns.map((col) => (
          <div key={col.id} className="w-64 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">{col.title}</h2>
              <div className="space-x-1">
                <button
                  onClick={() => renameColumn(col.id)}
                  className="text-xs text-blue-500"
                >
                  ✎
                </button>
                <button
                  onClick={() => deleteColumn(col.id)}
                  className="text-xs text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
            <Droppable droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[100px] space-y-2"
                >
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task, idx) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={idx}
                      >
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                          >
                          <TaskCard task={task} onClick={() => setEditingTask(task)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <TaskQuickNew
              onCreate={(title) =>
                createMut.mutate({ title, status: col.id })
              }
            />
          </div>
        ))}
      </DragDropContext>
      <div className="w-64 flex-shrink-0">
        <button
          onClick={addColumn}
          className="w-full border rounded p-2 text-sm"
        >
          + Add Column
        </button>
      </div>
      </div>
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          properties={properties}
          vendors={vendors}
          onClose={() => setEditingTask(null)}
          onSave={(data) => {
            updateMut.mutate({ id: editingTask.id, data });
            setEditingTask(null);
          }}
          onArchive={() => {
            archiveMut.mutate(editingTask.id);
            setEditingTask(null);
          }}
        />
      )}
    </>
  );
}

