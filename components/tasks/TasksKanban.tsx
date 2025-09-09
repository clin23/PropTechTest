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
import ColumnRenameModal from "./ColumnRenameModal";
import ColumnDeleteModal from "./ColumnDeleteModal";
import ColumnCreateModal from "./ColumnCreateModal";

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

  const [menuColumn, setMenuColumn] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Column | null>(null);
  const [deleting, setDeleting] = useState<Column | null>(null);
  const [creating, setCreating] = useState(false);
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

  const addColumn = (title: string) => {
    const id = title.toLowerCase().replace(/\s+/g, "_");
    setColumns([...columns, { id, title }]);
  };

  const renameColumn = (id: string, title: string) => {
    setColumns(columns.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const deleteColumn = (id: string) => {
    const remaining = columns.filter((c) => c.id !== id);
    const fallback = remaining[0]?.id || "todo";
    setColumns(remaining);
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
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuColumn(menuColumn === col.id ? null : col.id)
                  }
                  className="px-1"
                >
                  ⋯
                </button>
                {menuColumn === col.id && (
                  <div className="absolute right-0 mt-1 w-28 rounded border bg-white shadow text-sm z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <button
                      className="block w-full px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setMenuColumn(null);
                        setRenaming(col);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full px-3 py-1 text-left text-red-500 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                      onClick={() => {
                        setMenuColumn(null);
                        setDeleting(col);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Droppable droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
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
                  <TaskQuickNew
                    onCreate={(title) =>
                      createMut.mutate({ title, status: col.id })
                    }
                  />
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
      <div className="w-64 flex-shrink-0">
        <button
          onClick={() => setCreating(true)}
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
      {renaming && (
        <ColumnRenameModal
          column={renaming}
          onClose={() => setRenaming(null)}
          onSave={(title) => renameColumn(renaming.id, title)}
        />
      )}
      {deleting && (
        <ColumnDeleteModal
          column={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleteColumn(deleting.id)}
        />
      )}
      {creating && (
        <ColumnCreateModal
          onClose={() => setCreating(false)}
          onSave={(title) => addColumn(title)}
        />
      )}
    </>
  );
}

