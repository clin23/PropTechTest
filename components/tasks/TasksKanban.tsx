"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import type { PropertySummary } from "../../types/property";
import TaskCard from "./TaskCard";
import TaskQuickNew from "./TaskQuickNew";
import TaskEditModal from "./TaskEditModal";
import ColumnRenameModal from "./ColumnRenameModal";
import ColumnDeleteModal from "./ColumnDeleteModal";
import ColumnCreateModal from "./ColumnCreateModal";

const TAB_BASE_CLASSES =
  "rounded-full border px-4 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-600";
const TAB_ACTIVE_CLASSES =
  "bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900";
const TAB_INACTIVE_CLASSES =
  "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700";

const tabClassName = (isActive: boolean) =>
  [
    TAB_BASE_CLASSES,
    isActive ? TAB_ACTIVE_CLASSES : TAB_INACTIVE_CLASSES,
  ].join(" ");

type Column = { id: string; title: string };

const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "ASAP" },
  { id: "in_progress", title: "Soon" },
  { id: "blocked", title: "Later" },
  { id: "done", title: "Done" },
];

const STORAGE_KEY = "task-columns";

type PropertyContext = Pick<PropertySummary, "id" | "address">;
export type TasksKanbanContext = PropertyContext;

type TasksKanbanProps = {
  initialPropertyId?: string;
  allowPropertySwitching?: boolean;
  onContextChange?: (property: PropertyContext | null) => void;
};

export default function TasksKanban({
  initialPropertyId,
  allowPropertySwitching = true,
  onContextChange,
}: TasksKanbanProps) {
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>(
    initialPropertyId ?? "all"
  );

  useEffect(() => {
    if (initialPropertyId) {
      setActiveFilter(initialPropertyId);
    } else if (!allowPropertySwitching) {
      setActiveFilter("all");
    }
  }, [initialPropertyId, allowPropertySwitching]);

  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: () => listProperties(),
  });
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => listVendors(),
  });

  useEffect(() => {
    if (!allowPropertySwitching) return;
    if (activeFilter === "all") return;
    if (!properties.length) return;
    const exists = properties.some((property) => property.id === activeFilter);
    if (!exists) {
      setActiveFilter("all");
    }
  }, [activeFilter, allowPropertySwitching, properties]);

  const selectedPropertyId = activeFilter !== "all" ? activeFilter : undefined;

  const { data: tasks = [] } = useQuery<TaskDto[]>({
    queryKey: ["tasks", { propertyId: selectedPropertyId ?? null }],
    queryFn: () =>
      selectedPropertyId
        ? listTasks({ propertyId: selectedPropertyId })
        : listTasks(),
  });

  const activeProperty = selectedPropertyId
    ? properties.find((property) => property.id === selectedPropertyId)
    : undefined;

  useEffect(() => {
    if (!onContextChange) return;
    if (activeProperty) {
      onContextChange({
        id: activeProperty.id,
        address: activeProperty.address,
      });
    } else {
      onContextChange(null);
    }
  }, [activeProperty, onContextChange]);

  const defaultPropertyForCreation = selectedPropertyId
    ? activeProperty ?? null
    : properties[0] ?? null;

  const createMut = useMutation({
    mutationFn: ({ title, status }: { title: string; status: string }) =>
      createTask({
        title,
        status,
        properties: defaultPropertyForCreation
          ? [
              {
                id: defaultPropertyForCreation.id,
                address: defaultPropertyForCreation.address,
              },
            ]
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

  const handleTabSelect = (propertyId?: string) => {
    if (!allowPropertySwitching) return;
    if (!propertyId) {
      setActiveFilter("all");
    } else {
      setActiveFilter(propertyId);
    }
  };

  const newTaskPlaceholder = activeProperty
    ? `+ New task for ${activeProperty.address}`
    : "+ New task";

  const propertyTabs: PropertySummary[] = allowPropertySwitching
    ? properties
    : activeProperty
      ? [activeProperty]
      : [];

  const showPropertiesOnCards = !selectedPropertyId;

  return (
    <>
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
                              <TaskCard
                                task={task}
                                onClick={() => setEditingTask(task)}
                                showProperties={showPropertiesOnCards}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    <TaskQuickNew
                      onCreate={(title) =>
                        createMut.mutate({ title, status: col.id })
                      }
                      placeholder={newTaskPlaceholder}
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
        <Link href="/tasks/archive" className="w-64 flex-shrink-0">
          <span className="block w-full border rounded p-2 text-sm text-center">Archive</span>
        </Link>
      </div>
      <div className="mt-10 flex flex-col items-center gap-2">
        <div
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Task property filters"
        >
          {allowPropertySwitching && (
            <button
              type="button"
              onClick={() => handleTabSelect(undefined)}
              className={tabClassName(!selectedPropertyId)}

              aria-pressed={!selectedPropertyId}
            >
              All
            </button>
          )}
          {propertyTabs.map((property) => {
            const isActive = selectedPropertyId === property.id;
            return (
              <button
                key={property.id}
                type="button"
                onClick={() => handleTabSelect(property.id)}
                className={tabClassName(isActive)}
                aria-pressed={isActive}
                aria-disabled={!allowPropertySwitching}
              >
                {property.address}
              </button>
            );
          })}
        </div>
        {selectedPropertyId && activeProperty && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Creating tasks for{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {activeProperty.address}
            </span>
          </p>
        )}
      </div>
      {propertyIdFilter && activeProperty && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Creating tasks for{" "}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {activeProperty.address}
          </span>
        </p>
      )}
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
