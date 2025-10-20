"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  listProperties,
  updateExpense,
} from "../lib/api";
import { formatShortDate } from "../lib/format";
import type { ExpenseRow } from "../types/expense";
import type { PropertySummary } from "../types/property";
import EmptyState from "./EmptyState";
import ExpenseForm from "./ExpenseForm";
import NotePreview from "./NotePreview";
import { useScrollLockOnHover } from "../hooks/useScrollLockOnHover";

function ReceiptLink({ url }: { url?: string | null }) {
  if (!url) {
    return <span className="text-gray-500 dark:text-gray-400">&mdash;</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline dark:text-blue-300"
    >
      View
    </a>
  );
}

export default function ExpensesTable({
  propertyId,
}: {
  propertyId?: string;
}) {
  const queryClient = useQueryClient();
  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const [property, setProperty] = useState(propertyId ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);
  const [detailConfirm, setDetailConfirm] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    undo?: () => Promise<void> | void;
  } | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [search, setSearch] = useState("");
  const [fromPlaceholder, setFromPlaceholder] = useState("From (field 1)");
  const [toPlaceholder, setToPlaceholder] = useState("To (field 2)");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef(0);
  const editingSnapshotRef = useRef<ExpenseRow | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useScrollLockOnHover<HTMLDivElement>();

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  useEffect(() => {
    if (selectedExpense) {
      requestAnimationFrame(() => setDetailVisible(true));
    }
  }, [selectedExpense]);

  useEffect(() => {
    if (!notification) {
      return () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        if (removeTimeoutRef.current) {
          clearTimeout(removeTimeoutRef.current);
          removeTimeoutRef.current = null;
        }
      };
    }

    setNotificationVisible(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (removeTimeoutRef.current) {
      clearTimeout(removeTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setNotificationVisible(false);
      removeTimeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 200);
    }, 5000);

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
        removeTimeoutRef.current = null;
      }
    };
  }, [notification]);

  useEffect(() => {
    if (!sortMenuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!sortMenuRef.current) {
        return;
      }
      if (event.target instanceof Node && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [sortMenuOpen]);

  const params = {
    propertyId: propertyId ?? (property || undefined),
    from: from || undefined,
    to: to || undefined,
  };
  const queryKey = [
    "expenses",
    params.propertyId || "",
    from,
    to,
  ];
  const { data = [] } = useQuery<ExpenseRow[]>({
    queryKey,
    queryFn: () => listExpenses(params),
  });

  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) =>
      sortOrder === "asc"
        ? (a.date || "").localeCompare(b.date || "")
        : (b.date || "").localeCompare(a.date || "")
    );
    return sorted;
  }, [data, sortOrder]);

  const propertyMap = useMemo(
    () => Object.fromEntries(properties.map((p) => [p.id, p.address])),
    [properties]
  );

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return sortedData;
    }

    return sortedData.filter((expense) => {
      const total = (expense.amount ?? 0) + (expense.gst ?? 0);
      const haystack = [
        expense.category,
        expense.vendor,
        expense.notes,
        expense.label,
        expense.date,
        expense.amount ? String(expense.amount) : undefined,
        expense.gst ? String(expense.gst) : undefined,
        total ? String(total) : undefined,
        !propertyId ? propertyMap[expense.propertyId] : undefined,
      ];

      return haystack
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [propertyId, search, sortedData, propertyMap]);

  const deleteMutation = useMutation<
    unknown,
    unknown,
    string,
    { previous?: ExpenseRow[] }
  >({
    mutationFn: (id: string) => deleteExpense(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ExpenseRow[]>(queryKey);
      queryClient.setQueryData<ExpenseRow[]>(queryKey, (old = []) =>
        old.filter((e) => e.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const editDefaults = useMemo(() => {
    if (!editingExpense) return undefined;
    return {
      propertyId: editingExpense.propertyId,
      date: editingExpense.date,
      category: editingExpense.category,
      vendor: editingExpense.vendor,
      amount: String(editingExpense.amount ?? ""),
      gst: String(editingExpense.gst ?? ""),
      notes: editingExpense.notes ?? "",
      label: editingExpense.label ?? "",
    };
  }, [editingExpense]);

  const openDetail = (expense: ExpenseRow) => {
    setSelectedExpense(expense);
    setDetailConfirm("");
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setDetailConfirm("");
    setTimeout(() => {
      setSelectedExpense(null);
    }, 180);
  };

  const showNotification = (
    message: string,
    undo?: () => Promise<void> | void
  ) => {
    notificationIdRef.current += 1;
    setNotification({ id: notificationIdRef.current, message, undo });
  };

  const handleEdit = (expense: ExpenseRow) => {
    editingSnapshotRef.current = expense;
    closeDetail();
    setEditingExpense(expense);
    setEditOpen(true);
  };

  const handleDelete = (expense: ExpenseRow) => {
    const expenseId = expense.id;
    deleteMutation.mutate(expenseId, {
      onSuccess: async (_data, _variables, context) => {
        closeDetail();
        const previousEntries = context?.previous ?? [];
        const deletedEntry =
          previousEntries.find((entry) => entry.id === expenseId) ?? expense;
        showNotification("Expense deleted", async () => {
          await createExpense({
            propertyId: deletedEntry.propertyId,
            date: deletedEntry.date,
            category: deletedEntry.category,
            vendor: deletedEntry.vendor,
            amount: deletedEntry.amount,
            gst: deletedEntry.gst,
            notes: deletedEntry.notes,
            label: deletedEntry.label,
            receiptUrl: deletedEntry.receiptUrl,
          });
          await queryClient.invalidateQueries({ queryKey });
        });
      },
    });
  };

  const filterControlClass =
    "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const dateFilterClass = `${filterControlClass} w-32`;

  const datePlaceholder = "dd/mm/yyyy";

  const clearFilters = () => {
    if (!propertyId) {
      setProperty("");
    }
    setFrom("");
    setTo("");
    setSearch("");
    setFromPlaceholder("From (field 1)");
    setToPlaceholder("To (field 2)");
    setSortOrder("desc");
    setSortMenuOpen(false);
  };

  const confirmReady = detailConfirm.trim().toLowerCase() === "confirm";

  const hasRecords = data.length > 0;
  const hasMatches = filteredData.length > 0;

  let content = <EmptyState message="No expenses match your search." />;

  if (!hasRecords) {
    content = <EmptyState message="No expenses found." />;
  } else if (hasMatches) {
    content = (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {!propertyId && <th className="px-4 py-3 text-left">Property</th>}
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Vendor</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-left">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((r) => {
              const total = (r.amount ?? 0) + (r.gst ?? 0);

              return (
                <tr
                  key={r.id}
                  className="border-t transition dark:border-gray-700 hover:bg-gray-50 focus-within:bg-gray-50 dark:hover:bg-gray-700/60 dark:focus-within:bg-gray-700/60"
                  onClick={() => openDetail(r)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openDetail(r);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View expense ${r.vendor ? `from ${r.vendor}` : ""} dated ${formatShortDate(r.date)}`.trim()}
                >
                  {!propertyId && (
                    <td className="px-4 py-3">{propertyMap[r.propertyId] || r.propertyId}</td>
                  )}
                  <td className="px-4 py-3">{formatShortDate(r.date)}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.vendor || "—"}</td>
                  <td className="px-4 py-3">{total}</td>
                  <td className="px-4 py-3">
                    {r.notes ? (
                      <NotePreview note={r.notes} />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ReceiptLink url={r.receiptUrl} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="px-4 pb-3 pt-2 sm:px-6 lg:px-8">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex flex-1 basis-0 flex-wrap items-center gap-2 sm:basis-auto sm:flex-none sm:items-stretch">
              {!propertyId && (
                <select
                  className={`${filterControlClass} pr-10`}
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                >
                  <option value="">All properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="date"
                className={dateFilterClass}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder={fromPlaceholder}
                onFocus={() => setFromPlaceholder(datePlaceholder)}
                onBlur={() => {
                  if (!from) {
                    setFromPlaceholder("From (field 1)");
                  }
                }}
              />
              <input
                type="date"
                className={dateFilterClass}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={toPlaceholder}
                onFocus={() => setToPlaceholder(datePlaceholder)}
                onBlur={() => {
                  if (!to) {
                    setToPlaceholder("To (field 2)");
                  }
                }}
              />
              <div className="relative" ref={sortMenuRef}>
                <button
                  type="button"
                  className={`${filterControlClass} flex h-10 w-10 items-center justify-center px-0`}
                  onClick={() => setSortMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={sortMenuOpen}
                  aria-label="Toggle date sort order"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 7.5h7.5m-7.5 4.5h5.25M12 3v18m0 0 3-3m-3 3-3-3"
                    />
                  </svg>
                </button>
                <div
                  className={`absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-150 ease-out dark:border-gray-700 dark:bg-gray-800 ${
                    sortMenuOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                  }`}
                  role="menu"
                >
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      sortOrder === "asc" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => {
                      setSortOrder("asc");
                      setSortMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span>Date ascending</span>
                    {sortOrder === "asc" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.004 7a1 1 0 0 1-1.42 0l-3.002-3a1 1 0 1 1 1.42-1.42L9 11.59l6.294-6.3a1 1 0 0 1 1.41 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      sortOrder === "desc" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => {
                      setSortOrder("desc");
                      setSortMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span>Date descending</span>
                    {sortOrder === "desc" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.004 7a1 1 0 0 1-1.42 0l-3.002-3a1 1 0 1 1 1.42-1.42L9 11.59l6.294-6.3a1 1 0 0 1 1.41 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-1 basis-full flex-wrap items-center justify-end gap-2 sm:basis-auto sm:flex-1">
              <div className="relative flex-1 min-w-[14rem] sm:min-w-[18rem]">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 1 0 3.356 9.86l3.641 3.642a.75.75 0 1 0 1.06-1.061l-3.64-3.642A5.5 5.5 0 0 0 9 3.5ZM5.5 9a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  className={`${filterControlClass} w-full pl-10`}
                  placeholder="Search for an expense"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search expenses"
                />
              </div>
              <button
                type="button"
                className="h-10 rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-2 px-4 pt-4 sm:px-6 lg:px-8">{content}</div>
      </div>
      <ExpenseForm
        propertyId={propertyId}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingExpense(null);
          }
        }}
        showTrigger={false}
        defaults={editDefaults}
        mode="edit"
        expenseId={editingExpense?.id}
        onSaved={(updated) => {
          queryClient.invalidateQueries({ queryKey });
          showNotification("Expense updated", async () => {
            const previous = editingSnapshotRef.current;
            if (!previous) {
              return;
            }
            await updateExpense(updated.id, {
              propertyId: previous.propertyId,
              date: previous.date,
              category: previous.category,
              vendor: previous.vendor,
              amount: previous.amount,
              gst: previous.gst,
              notes: previous.notes,
              label: previous.label,
            });
            await queryClient.invalidateQueries({ queryKey });
          });
          editingSnapshotRef.current = null;
        }}
      />
      {selectedExpense &&
        portalTarget &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-10 sm:items-center sm:pb-10 ${
              detailVisible ? "opacity-100" : "opacity-0"
            } transition-opacity duration-150`}
            onClick={closeDetail}
          >
            <div
              className={`w-full max-w-lg transform rounded-xl bg-white p-5 text-gray-900 shadow-xl transition-all duration-200 dark:bg-gray-900 dark:text-gray-100 ${
                detailVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Expense details</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Click edit or delete after typing <span className="font-medium">confirm</span> below.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  onClick={closeDetail}
                  aria-label="Close details"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {!propertyId && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Property</dt>
                    <dd>{propertyMap[selectedExpense.propertyId] || selectedExpense.propertyId}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                  <dd>{formatShortDate(selectedExpense.date)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                  <dd>{selectedExpense.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Vendor</dt>
                  <dd>{selectedExpense.vendor || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Total</dt>
                  <dd>{selectedExpense.amount + selectedExpense.gst}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
                  <dd>{selectedExpense.amount}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">GST</dt>
                  <dd>{selectedExpense.gst}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="break-words">
                    {selectedExpense.notes ? (
                      <span>{selectedExpense.notes}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">—</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Receipt</dt>
                  <dd>
                    <ReceiptLink url={selectedExpense.receiptUrl} />
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Type <span className="uppercase">confirm</span> to edit or delete
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  value={detailConfirm}
                  onChange={(event) => setDetailConfirm(event.target.value)}
                  placeholder="confirm"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={closeDetail}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:text-blue-100"
                  onClick={() => selectedExpense && handleEdit(selectedExpense)}
                  disabled={!confirmReady}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
                  onClick={() => selectedExpense && handleDelete(selectedExpense)}
                  disabled={!confirmReady || deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          portalTarget,
        )}
      {notification &&
        portalTarget &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[60] flex w-full max-w-sm justify-end text-sm">
            <div
              className={`flex w-full items-center justify-between gap-4 rounded-lg bg-gray-900/90 px-4 py-3 text-white shadow-lg backdrop-blur transition-all duration-200 ${
                notificationVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
            >
              <span>{notification.message}</span>
              {notification.undo && (
                <button
                  type="button"
                  className="rounded-md border border-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
                  onClick={async () => {
                    if (hideTimeoutRef.current) {
                      clearTimeout(hideTimeoutRef.current);
                      hideTimeoutRef.current = null;
                    }
                    if (removeTimeoutRef.current) {
                      clearTimeout(removeTimeoutRef.current);
                      removeTimeoutRef.current = null;
                    }
                    await notification.undo?.();
                    setNotificationVisible(false);
                    setNotification(null);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          </div>,
          portalTarget,
        )}
    </div>
  );
}
