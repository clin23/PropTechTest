"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createIncome,
  deleteIncome,
  listIncome,
  updateIncome,
} from "../lib/api";
import { formatShortDate } from "../lib/format";
import type { IncomeRow } from "../types/income";
import EmptyState from "./EmptyState";
import EvidenceLink from "./EvidenceLink";
import IncomeForm from "./IncomeForm";

interface IncomesTableProps {
  propertyId: string;
  excludeCategories?: string[];
}

export default function IncomesTable({
  propertyId,
  excludeCategories = [],
}: IncomesTableProps) {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<IncomeRow[]>({
    queryKey: ["income", propertyId],
    queryFn: () => listIncome(propertyId),
  });
  const deleteMutation = useMutation<
    unknown,
    unknown,
    string,
    { previousIncome?: IncomeRow[] }
  >({
    mutationFn: (id: string) => deleteIncome(propertyId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["income", propertyId] });
      const previousIncome = queryClient.getQueryData<IncomeRow[]>([
        "income",
        propertyId,
      ]);
      queryClient.setQueryData<IncomeRow[]>([
        "income",
        propertyId,
      ], (old = []) => old.filter((i) => i.id !== id));
      return { previousIncome };
    },
    onError: (_err, _id, context) => {
      if (context?.previousIncome) {
        queryClient.setQueryData(["income", propertyId], context.previousIncome);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["income", propertyId] });
    },
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [fromPlaceholder, setFromPlaceholder] = useState("From (field 1)");
  const [toPlaceholder, setToPlaceholder] = useState("To (field 2)");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRow | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRow | null>(null);
  const [detailConfirm, setDetailConfirm] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    undo?: () => Promise<void> | void;
  } | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef(0);
  const editingSnapshotRef = useRef<IncomeRow | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const excludedCategories = useMemo(
    () => excludeCategories.map((value) => value.trim().toLowerCase()),
    [excludeCategories]
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  useEffect(() => {
    if (selectedIncome) {
      requestAnimationFrame(() => setDetailVisible(true));
    }
  }, [selectedIncome]);

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

  const filtered = useMemo(() => {
    if (!excludedCategories.length) {
      return data;
    }
    return data.filter((row) => {
      const categoryValue = row.category?.toLowerCase().trim() ?? "";
      return !excludedCategories.includes(categoryValue);
    });
  }, [data, excludedCategories]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const matches = filtered.filter((r) => {
      const afterFrom = from ? new Date(r.date) >= new Date(from) : true;
      const beforeTo = to ? new Date(r.date) <= new Date(to) : true;

      if (!term) {
        return afterFrom && beforeTo;
      }

      const haystack = [
        r.category,
        r.label,
        r.notes,
        r.date,
        r.amount !== undefined ? String(r.amount) : undefined,
        r.evidenceName,
      ];

      const matchesTerm = haystack
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(term));

      return afterFrom && beforeTo && matchesTerm;
    });

    const sorted = [...matches];
    sorted.sort((a, b) =>
      sortOrder === "asc"
        ? (a.date || "").localeCompare(b.date || "")
        : (b.date || "").localeCompare(a.date || "")
    );

    return sorted;
  }, [filtered, from, search, sortOrder, to]);

  const openDetail = (income: IncomeRow) => {
    setSelectedIncome(income);
    setDetailConfirm("");
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setDetailConfirm("");
    setTimeout(() => {
      setSelectedIncome(null);
    }, 180);
  };

  const showNotification = (
    message: string,
    undo?: () => Promise<void> | void
  ) => {
    notificationIdRef.current += 1;
    setNotification({ id: notificationIdRef.current, message, undo });
  };

  const datePlaceholder = "dd/mm/yyyy";

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setSearch("");
    setFromPlaceholder("From (field 1)");
    setToPlaceholder("To (field 2)");
    setSortOrder("desc");
    setSortMenuOpen(false);
  };

  const handleEdit = (income: IncomeRow) => {
    editingSnapshotRef.current = income;
    closeDetail();
    setEditingIncome(income);
  };

  const handleDelete = (income: IncomeRow) => {
    const incomeId = income.id;
    deleteMutation.mutate(incomeId, {
      onSuccess: async (_data, _variables, context) => {
        closeDetail();
        const previousEntries = context?.previousIncome ?? [];
        const deletedEntry =
          previousEntries.find((entry) => entry.id === incomeId) ?? income;
        showNotification("Income deleted", async () => {
          await createIncome(deletedEntry.propertyId, {
            date: deletedEntry.date,
            category: deletedEntry.category,
            amount: deletedEntry.amount,
            notes: deletedEntry.notes,
            label: deletedEntry.label,
            evidenceUrl: deletedEntry.evidenceUrl,
            evidenceName: deletedEntry.evidenceName,
          });
          await queryClient.invalidateQueries({
            queryKey: ["income", deletedEntry.propertyId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["pnl", deletedEntry.propertyId],
          });
        });
      },
    });
  };

  const hasMatches = rows.length > 0;
  const hasRecords = filtered.length > 0;

  let content = <EmptyState message="No income entries match your filters." />;

  if (!hasRecords) {
    content = <EmptyState message="No income records found." />;
  } else if (hasMatches) {
    content = (
      <div className="-mx-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:-mx-6 dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-center">Evidence</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
                aria-label={`View income entry for ${formatShortDate(r.date)}`}
              >
                <td className="px-4 py-3">{formatShortDate(r.date)}</td>
                <td className="px-4 py-3">{r.category || r.label || "—"}</td>
                <td className="px-4 py-3 text-center">
                  {r.evidenceUrl ? (
                    <EvidenceLink
                      href={r.evidenceUrl}
                      fileName={r.evidenceName}
                      className="mx-auto"
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3">{r.amount}</td>
                <td className="px-4 py-3">
                  {r.notes ? (
                    <span
                      className="inline-flex items-center text-gray-600 dark:text-gray-300"
                      title={r.notes}
                      aria-label="View note"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
                        <path d="M8 7a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H8Zm0 4a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H8Z" />
                      </svg>
                      <span className="sr-only">Note available</span>
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const filterControlClass =
    "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const dateFilterClass = `${filterControlClass} w-32`;

  const confirmReady = detailConfirm.trim().toLowerCase() === "confirm";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-20 -mx-4 border-b border-gray-200 bg-white px-4 pb-3 pt-2 shadow-sm sm:-mx-6 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-1 basis-0 flex-wrap items-center gap-2 sm:basis-auto sm:flex-none sm:items-stretch">
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
                placeholder="Search for other income"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search for other income"
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
      <div className="flex-1 overflow-y-auto pt-4">{content}</div>
      <IncomeForm
        propertyId={propertyId}
        open={Boolean(editingIncome)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingIncome(null);
          }
        }}
        showTrigger={false}
        initialIncome={editingIncome}
        onCreated={() => setEditingIncome(null)}
        onSaved={(updated) => {
          queryClient.invalidateQueries({ queryKey: ["income", propertyId] });
          queryClient.invalidateQueries({ queryKey: ["pnl", propertyId] });
          showNotification("Income updated", async () => {
            const previous = editingSnapshotRef.current;
            if (!previous) {
              return;
            }
            await updateIncome(previous.propertyId, updated.id, {
              date: previous.date,
              category: previous.category,
              amount: previous.amount,
              notes: previous.notes,
              label: previous.label,
              evidenceUrl: previous.evidenceUrl ?? null,
              evidenceName: previous.evidenceName ?? null,
            });
            await queryClient.invalidateQueries({
              queryKey: ["income", previous.propertyId],
            });
            await queryClient.invalidateQueries({
              queryKey: ["pnl", previous.propertyId],
            });
          });
          editingSnapshotRef.current = null;
        }}
      />
      {selectedIncome &&
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
                  <h2 className="text-lg font-semibold">Income details</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Type <span className="font-medium">confirm</span> below to edit or delete this entry.
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
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                  <dd>{formatShortDate(selectedIncome.date)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                  <dd>{selectedIncome.category || selectedIncome.label || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
                  <dd>{selectedIncome.amount}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Evidence</dt>
                  <dd>
                    {selectedIncome.evidenceUrl ? (
                      <EvidenceLink
                        href={selectedIncome.evidenceUrl}
                        fileName={selectedIncome.evidenceName}
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">—</span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="break-words">
                    {selectedIncome.notes ? (
                      <span>{selectedIncome.notes}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">—</span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Type <span className="uppercase">confirm</span> to continue
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
                  onClick={() => selectedIncome && handleEdit(selectedIncome)}
                  disabled={!confirmReady}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
                  onClick={() => selectedIncome && handleDelete(selectedIncome)}
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
