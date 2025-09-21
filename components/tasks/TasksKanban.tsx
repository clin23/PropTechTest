"use client";

import { useState, useEffect, useMemo } from "react";
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

type ColumnMap = Record<string, Column[]>;

const cloneColumns = (columns: Column[]): Column[] =>
  columns.map((column) => ({ ...column }));

const createDefaultColumns = (): Column[] => cloneColumns(DEFAULT_COLUMNS);

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
  const [propertyOrder, setPropertyOrder] = useState<string[]>([]);

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
    if (!isPropertyModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPropertyModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPropertyModalOpen]);

  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: () => listProperties(),
  });
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => listVendors(),
  });

  useEffect(() => {
    const propertyIds = properties.map((property) => property.id);
    setPropertyOrder((prev) => {
      const filteredPrev = prev.filter((id) => propertyIds.includes(id));
      const missing = propertyIds.filter((id) => !filteredPrev.includes(id));
      const next = [...filteredPrev, ...missing];
      if (
        next.length === prev.length &&
        next.every((id, index) => id === prev[index])
      ) {
        return prev;
      }
      return next;
    });
  }, [properties]);

  const orderedPropertyList = useMemo(() => {
    if (!properties.length) return [];
    const propertyMap = new Map(properties.map((property) => [property.id, property]));
    const ordered = propertyOrder
      .map((id) => propertyMap.get(id))
      .filter((property): property is PropertySummary => Boolean(property));
    if (ordered.length === properties.length) {
      return ordered;
    }
    const remaining = properties.filter(
      (property) => !propertyOrder.includes(property.id)
    );
    return [...ordered, ...remaining];
  }, [properties, propertyOrder]);

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

  const activeProperty = useMemo(() => {
    if (!selectedPropertyId) return undefined;
    return orderedPropertyList.find(
      (property) => property.id === selectedPropertyId
    );
  }, [orderedPropertyList, selectedPropertyId]);

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
    : orderedPropertyList[0] ?? null;

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
    updateMut.mutate({ id: draggableId, data: { status: destination.droppableId } });
  };

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
    ? orderedPropertyList
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

  const handlePropertyReorder = (orderedIds: string[]) => {
    setPropertyOrder((prev) => {
      if (
        prev.length === orderedIds.length &&
        prev.every((id, index) => id === orderedIds[index])
      ) {
        return prev;
      }
      return orderedIds;
    });
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto p-1 pb-32">
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
            properties={propertyTabs}
            selectedPropertyId={selectedPropertyId}
            onSelect={handlePropertySelect}
            onReorder={handlePropertyReorder}
            allowAll={allowPropertySwitching}
          />
        </>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          properties={orderedPropertyList}
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

type PropertySelectModalProps = {
  open: boolean;
  properties: PropertySummary[];
  selectedPropertyId?: string;
  onSelect: (propertyId?: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onClose: () => void;
  allowAll: boolean;
};

function PropertySelectModal({
  open,
  properties,
  selectedPropertyId,
  onSelect,
  onReorder,
  onClose,
  allowAll,
}: PropertySelectModalProps) {
  if (!open) return null;

  const optionClassName = (isActive: boolean) =>
    [
      "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2 text-sm transition",
      isActive
        ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
        : "border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
    ].join(" ");

  const handleSelect = (propertyId?: string) => {
    onSelect(propertyId);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    const reordered = Array.from(properties);
    const [moved] = reordered.splice(source.index, 1);
    if (!moved) return;
    reordered.splice(destination.index, 0, moved);
    onReorder(reordered.map((property) => property.id));
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
          <DragDropContext onDragEnd={handleDragEnd}>
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
              <Droppable droppableId="property-list">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className="space-y-2"
                  >
                    {properties.map((property, index) => {
                      const isActive = selectedPropertyId === property.id;
                      return (
                        <Draggable
                          key={property.id}
                          draggableId={property.id}
                          index={index}
                        >
                          {(draggableProvided) => (
                            <div
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              className={optionClassName(isActive)}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelect(property.id)}
                                className="flex flex-1 items-center justify-between gap-3 text-left focus:outline-none"
                                aria-pressed={isActive}
                              >
                                <span>{property.address}</span>
                                {isActive && <span aria-hidden="true">✓</span>}
                              </button>
                              <span
                                {...draggableProvided.dragHandleProps}
                                className="ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-gray-400 transition hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:cursor-grabbing cursor-grab dark:text-gray-500 dark:hover:text-gray-300 dark:focus-visible:ring-gray-600 dark:focus-visible:ring-offset-gray-900"
                                aria-label={`Reorder ${property.address}`}
                              >
                                <span aria-hidden="true">⋮⋮</span>
                              </span>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );

}
