"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  completeTask,
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

const caretButtonClassName = [
  TAB_BASE_CLASSES,
  TAB_INACTIVE_CLASSES,
  "px-2 py-1 text-base leading-none",
].join(" ");

type Column = { id: string; title: string };

const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "ASAP" },
  { id: "in_progress", title: "Soon" },
  { id: "blocked", title: "Later" },
  { id: "done", title: "Done" },
];

const STORAGE_KEY = "task-columns";
const DEFAULT_SCOPE = "__default__";
const PROPERTY_ORDER_STORAGE_KEY = "task-property-order";

type ColumnMap = Record<string, Column[]>;

const cloneColumns = (columns: Column[]): Column[] =>
  columns.map((column) => ({ ...column }));

const createDefaultColumns = (): Column[] => cloneColumns(DEFAULT_COLUMNS);

const sanitizeIdArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;

  const sanitized = value.filter((item): item is string => typeof item === "string");

  return sanitized.length ? sanitized : null;
};

const sanitizeColumnArray = (value: unknown): Column[] | null => {
  if (!Array.isArray(value)) return null;

  const sanitized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const { id, title } = item as { id?: unknown; title?: unknown };
      if (typeof id !== "string" || typeof title !== "string") return null;
      return { id, title } as Column;
    })
    .filter((item): item is Column => item !== null);

  return sanitized.length ? sanitized : null;
};

const resolveColumnsForKey = (map: ColumnMap, key: string): Column[] => {
  if (map[key]?.length) {
    return cloneColumns(map[key]!);
  }

  if (key !== DEFAULT_SCOPE && map[DEFAULT_SCOPE]?.length) {
    return cloneColumns(map[DEFAULT_SCOPE]!);
  }

  return createDefaultColumns();
};

const getAllColumns = (map: ColumnMap): Column[] => {
  const seen = new Set<string>();
  const aggregated: Column[] = [];

  const addColumns = (columns: Column[] | undefined) => {
    if (!columns?.length) return;
    columns.forEach((column) => {
      if (seen.has(column.id)) return;
      seen.add(column.id);
      aggregated.push({ ...column });
    });
  };

  addColumns(map[DEFAULT_SCOPE]?.length ? map[DEFAULT_SCOPE] : DEFAULT_COLUMNS);

  Object.entries(map).forEach(([key, columns]) => {
    if (key === DEFAULT_SCOPE) return;
    addColumns(columns);
  });

  if (!aggregated.length) {
    return createDefaultColumns();
  }

  return aggregated;
};

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
  const [columnsByProperty, setColumnsByProperty] = useState<ColumnMap>({});
  const [columnsLoaded, setColumnsLoaded] = useState(false);
  const [isPropertyModalOpen, setPropertyModalOpen] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [propertyOrder, setPropertyOrder] = useState<string[]>([]);
  const [propertyOrderLoaded, setPropertyOrderLoaded] = useState(false);

  useEffect(() => {
    if (initialPropertyId) {
      setActiveFilter(initialPropertyId);
    } else if (!allowPropertySwitching) {
      setActiveFilter("all");
    }
  }, [initialPropertyId, allowPropertySwitching]);

  useEffect(() => {
    let parsedColumns: ColumnMap = {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          const sanitized = sanitizeColumnArray(data);
          if (sanitized) {
            parsedColumns[DEFAULT_SCOPE] = sanitized;
          }
        } else if (data && typeof data === "object") {
          parsedColumns = Object.entries(
            data as Record<string, unknown>
          ).reduce((acc, [key, value]) => {
            const sanitized = sanitizeColumnArray(value);
            if (sanitized) {
              acc[key] = sanitized;
            }
            return acc;
          }, {} as ColumnMap);
        }
      } catch (error) {
        console.warn("Failed to parse stored task columns", error);
      }
    }

    setColumnsByProperty(parsedColumns);
    setColumnsLoaded(true);
  }, []);

  useEffect(() => {
    if (!columnsLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnsByProperty));
  }, [columnsByProperty, columnsLoaded]);

  useEffect(() => {
    let parsed: string[] | null = null;
    const raw = localStorage.getItem(PROPERTY_ORDER_STORAGE_KEY);

    if (raw) {
      try {
        parsed = sanitizeIdArray(JSON.parse(raw));
      } catch (error) {
        console.warn("Failed to parse stored property order", error);
      }
    }

    if (parsed) {
      setPropertyOrder(parsed);
    }

    setPropertyOrderLoaded(true);
  }, []);

  useEffect(() => {
    if (!propertyOrderLoaded) return;

    try {
      if (!propertyOrder.length) {
        localStorage.removeItem(PROPERTY_ORDER_STORAGE_KEY);
      } else {
        localStorage.setItem(
          PROPERTY_ORDER_STORAGE_KEY,
          JSON.stringify(propertyOrder)
        );
      }
    } catch (error) {
      console.warn("Failed to persist property order", error);
    }
  }, [propertyOrder, propertyOrderLoaded]);

  useEffect(() => {
    if (!isPropertyModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPropertyModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPropertyModalOpen]);

  const {
    data: properties = [],
    isSuccess: propertiesLoaded,
  } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: () => listProperties(),
  });
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => listVendors(),
  });

  useEffect(() => {
    if (!propertyOrderLoaded || !propertiesLoaded) return;
    if (!propertyOrder.length) return;

    const validIds = new Set(properties.map((property) => property.id));
    setPropertyOrder((prev) => {
      if (!prev.length) return prev;

      const filtered = prev.filter((id) => validIds.has(id));
      if (filtered.length === prev.length) {
        return prev;
      }

      return filtered;
    });
  }, [properties, propertiesLoaded, propertyOrderLoaded, propertyOrder]);

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

  const orderedProperties = useMemo(() => {
    if (!propertyOrder.length) return properties;

    const byId = new Map(properties.map((property) => [property.id, property]));
    const seen = new Set<string>();
    const ordered: PropertySummary[] = [];

    propertyOrder.forEach((id) => {
      const property = byId.get(id);
      if (!property) return;
      if (seen.has(id)) return;
      seen.add(id);
      ordered.push(property);
    });

    properties.forEach((property) => {
      if (seen.has(property.id)) return;
      ordered.push(property);
    });

    return ordered;
  }, [properties, propertyOrder]);

  const columns = useMemo(() => {
    if (!columnsLoaded) {
      return createDefaultColumns();
    }

    if (!selectedPropertyId) {
      return getAllColumns(columnsByProperty);
    }

    return resolveColumnsForKey(columnsByProperty, selectedPropertyId);
  }, [columnsByProperty, columnsLoaded, selectedPropertyId]);

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
  const completeMut = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);

  const [menuColumn, setMenuColumn] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Column | null>(null);
  const [deleting, setDeleting] = useState<Column | null>(null);
  const [creating, setCreating] = useState(false);

  const updateColumnsForCurrentScope = (
    updater: (columns: Column[]) => Column[]
  ) => {
    if (!columnsLoaded) return;

    const key = selectedPropertyId ?? DEFAULT_SCOPE;
    setColumnsByProperty((prev) => ({
      ...prev,
      [key]: updater(resolveColumnsForKey(prev, key)),
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    setStatusOverrides((prev) => {
      if (!prev[draggableId]) return prev;
      const { [draggableId]: _removed, ...rest } = prev;
      return rest;
    });
    updateMut.mutate({ id: draggableId, data: { status: destination.droppableId } });
  };

  const handlePropertyReorder = useCallback(
    (nextOrder: string[]) => {
      if (!propertyOrderLoaded) return;

      const validIds = new Set(properties.map((property) => property.id));
      const seen = new Set<string>();
      const sanitized: string[] = [];

      nextOrder.forEach((id) => {
        if (!validIds.has(id)) return;
        if (seen.has(id)) return;
        seen.add(id);
        sanitized.push(id);
      });

      if (!sanitized.length) {
        if (!propertyOrder.length) return;
        setPropertyOrder([]);
        return;
      }

      const isSameOrder =
        sanitized.length === propertyOrder.length &&
        sanitized.every((id, index) => id === propertyOrder[index]);

      if (isSameOrder) return;

      setPropertyOrder(sanitized);
    },
    [properties, propertyOrder, propertyOrderLoaded]
  );

  const addColumn = (title: string) => {
    const id = title.toLowerCase().replace(/\s+/g, "_");
    updateColumnsForCurrentScope((cols) => {
      if (cols.some((column) => column.id === id)) {
        return cols;
      }
      return [...cols, { id, title }];
    });
  };

  const renameColumn = (id: string, title: string) => {
    updateColumnsForCurrentScope((cols) =>
      cols.map((column) => (column.id === id ? { ...column, title } : column))
    );
  };

  const deleteColumn = (id: string) => {
    setStatusOverrides((prev) => {
      if (!Object.keys(prev).length) return prev;
      let changed = false;
      const next: Record<string, string> = {};
      Object.entries(prev).forEach(([taskId, columnId]) => {
        if (columnId === id) {
          changed = true;
          return;
        }
        next[taskId] = columnId;
      });
      return changed ? next : prev;
    });
    const remaining = columns.filter((column) => column.id !== id);
    const fallbackColumns = remaining.length ? remaining : createDefaultColumns();
    const fallback = fallbackColumns[0]?.id || "todo";
    updateColumnsForCurrentScope(() => fallbackColumns);
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

  const handlePropertySelect = (propertyId?: string) => {
    handleTabSelect(propertyId);
    setPropertyModalOpen(false);
  };

  const newTaskPlaceholder = activeProperty
    ? `+ New task for ${activeProperty.address}`
    : "+ New task";

  const propertyTabs: PropertySummary[] = allowPropertySwitching
    ? orderedProperties
    : activeProperty
      ? [activeProperty]
      : [];

  const MAX_VISIBLE_PROPERTIES = 3;
  const hasExtraProperties = propertyTabs.length > MAX_VISIBLE_PROPERTIES;

  let visibleProperties = propertyTabs.slice(0, MAX_VISIBLE_PROPERTIES);

  if (hasExtraProperties && activeProperty) {
    const includesActive = visibleProperties.some(
      (property) => property.id === activeProperty.id
    );
    if (!includesActive) {
      visibleProperties[visibleProperties.length - 1] = activeProperty;
    }
  }

  visibleProperties = visibleProperties.filter((property, index, array) => {
    if (!property) return false;
    return array.findIndex((item) => item.id === property.id) === index;
  });

  const showCaretButton = allowPropertySwitching && hasExtraProperties;

  const showPropertiesOnCards = !selectedPropertyId;
  const canReorderProperties =
    propertyOrderLoaded && allowPropertySwitching && properties.length > 1;

  useEffect(() => {
    setStatusOverrides((prev) => {
      if (!Object.keys(prev).length) return prev;
      const validColumnIds = new Set(columns.map((column) => column.id));
      let changed = false;
      const next: Record<string, string> = {};

      Object.entries(prev).forEach(([taskId, columnId]) => {
        if (!validColumnIds.has(columnId)) {
          changed = true;
          return;
        }
        next[taskId] = columnId;
      });

      return changed ? next : prev;
    });
  }, [columns]);

  useEffect(() => {
    setStatusOverrides((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next = { ...prev };
      let changed = false;

      tasks.forEach((task) => {
        if (task.status !== "done" && next[task.id]) {
          delete next[task.id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [tasks]);

  const resolveDisplayStatus = useCallback(
    (task: TaskDto) => {
      const override = statusOverrides[task.id];
      if (
        override &&
        columns.some((column) => column.id === override)
      ) {
        return override;
      }
      return task.status;
    },
    [statusOverrides, columns]
  );

  const tasksByColumn = useMemo(() => {
    const grouped = new Map<string, TaskDto[]>();
    tasks.forEach((task) => {
      const status = resolveDisplayStatus(task);
      const existing = grouped.get(status);
      if (existing) {
        existing.push(task);
      } else {
        grouped.set(status, [task]);
      }
    });
    return grouped;
  }, [tasks, resolveDisplayStatus]);

  const handleCompleteTask = async (task: TaskDto) => {
    if (completeMut.isPending) return;

    const previousStatus = resolveDisplayStatus(task);
    setCompletingTaskId(task.id);
    try {
      await completeMut.mutateAsync(task.id);
    } catch (error) {
      console.error("Failed to complete task", error);
      setCompletingTaskId(null);
      return;
    }

    const shouldArchive = window.confirm(
      "Task completed. Would you like to archive it now?"
    );
    if (shouldArchive) {
      try {
        await archiveMut.mutateAsync(task.id);
        setStatusOverrides((prev) => {
          if (!prev[task.id]) return prev;
          const { [task.id]: _omit, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        console.error("Failed to archive task", error);
        setStatusOverrides((prev) => ({
          ...prev,
          [task.id]: previousStatus,
        }));
      } finally {
        setCompletingTaskId(null);
      }
      return;
    }

    setStatusOverrides((prev) => ({
      ...prev,
      [task.id]: previousStatus,
    }));
    setCompletingTaskId(null);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto p-1 pb-32">
        <DragDropContext onDragEnd={handleDragEnd}>
          {columns.map((col) => {
            const columnTasks = tasksByColumn.get(col.id) ?? [];
            return (
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
                      {columnTasks.map((task, idx) => (
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
                                onComplete={
                                  task.status !== "done"
                                    ? () => handleCompleteTask(task)
                                    : undefined
                                }
                                isCompleted={task.status === "done"}
                                isCompleting={
                                  completingTaskId === task.id &&
                                  completeMut.isPending
                                }
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
            );
          })}
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
      {allowPropertySwitching && (
        <>
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 w-full -translate-x-1/2 px-4">
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <div
                className="flex flex-wrap justify-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/90"
                role="tablist"
                aria-label="Task property filters"
              >
                <button
                  type="button"
                  onClick={() => handlePropertySelect(undefined)}
                  className={tabClassName(!selectedPropertyId)}
                  aria-pressed={!selectedPropertyId}
                >
                  All
                </button>
                {visibleProperties.map((property) => {
                  const isActive = selectedPropertyId === property.id;
                  return (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => handlePropertySelect(property.id)}
                      className={tabClassName(isActive)}
                      aria-pressed={isActive}
                    >
                      {property.address}
                    </button>
                  );
                })}
                {showCaretButton && (
                  <button
                    type="button"
                    onClick={() => setPropertyModalOpen(true)}
                    className={caretButtonClassName}
                    aria-haspopup="dialog"
                    aria-expanded={isPropertyModalOpen}
                    title="Show all properties"
                    aria-label="Show all properties"
                  >
                    ^
                  </button>
                )}
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
          </div>

          <PropertySelectModal
            open={isPropertyModalOpen}
            onClose={() => setPropertyModalOpen(false)}
            properties={orderedProperties}
            selectedPropertyId={selectedPropertyId}
            onSelect={handlePropertySelect}
            onReorder={
              canReorderProperties ? handlePropertyReorder : undefined
            }
            allowAll={allowPropertySwitching}
          />
        </>
      )}

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
            setStatusOverrides((prev) => {
              if (!editingTask) return prev;
              if (!prev[editingTask.id]) return prev;
              const { [editingTask.id]: _omit, ...rest } = prev;
              return rest;
            });
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

type PropertySelectModalProps = {
  open: boolean;
  properties: PropertySummary[];
  selectedPropertyId?: string;
  onSelect: (propertyId?: string) => void;
  onClose: () => void;
  allowAll: boolean;
  onReorder?: (propertyIds: string[]) => void;
};

function PropertySelectModal(props: PropertySelectModalProps) {
  const {
    open,
    properties,
    selectedPropertyId,
    onSelect,
    onClose,
    allowAll,
    onReorder: handleReorder,
  } = props;
  if (!open) return null;

  const optionClassName = (isActive: boolean) =>
    [
      "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2 text-sm transition",
      isActive
        ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
        : "border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
    ].join(" ");

  const reorderable =
    typeof handleReorder === "function" && properties.length > 1;

  const handleMove = (propertyId: string, direction: -1 | 1) => {
    if (!reorderable) return;

    const currentOrder = properties.map((property) => property.id);
    const currentIndex = currentOrder.indexOf(propertyId);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, moved);

    handleReorder?.(nextOrder);
  };

  const handleSelect = (propertyId?: string) => {
    onSelect(propertyId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="All properties"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Select a property
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-600"
            aria-label="Close property selector"
          >
            ×
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="space-y-2">
            {allowAll && (
              <button
                type="button"
                onClick={() => handleSelect(undefined)}
                className={optionClassName(!selectedPropertyId)}
                aria-pressed={!selectedPropertyId}
              >
                <span>All properties</span>
                {!selectedPropertyId && <span aria-hidden="true">✓</span>}
              </button>
            )}
            {properties.map((property, index) => {
              const isActive = selectedPropertyId === property.id;
              const selectClassName = [
                optionClassName(isActive),
                reorderable ? "flex-1" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={property.id}
                  className={reorderable ? "flex items-center gap-2" : undefined}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(property.id)}
                    className={selectClassName}
                    aria-pressed={isActive}
                  >
                    <span>{property.address}</span>
                    {isActive && <span aria-hidden="true">✓</span>}
                  </button>
                  {reorderable && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleMove(property.id, -1);
                        }}
                        className="rounded border px-2 py-1 text-xs text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
                        aria-label={`Move ${property.address} up`}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleMove(property.id, 1);
                        }}
                        className="rounded border px-2 py-1 text-xs text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
                        aria-label={`Move ${property.address} down`}
                        disabled={index === properties.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
