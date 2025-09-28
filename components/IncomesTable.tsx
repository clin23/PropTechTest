"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listIncome, deleteIncome } from "../lib/api";
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
  const [editingIncome, setEditingIncome] = useState<IncomeRow | null>(null);

  const excludedCategories = useMemo(
    () => excludeCategories.map((value) => value.trim().toLowerCase()),
    [excludeCategories]
  );

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

    return filtered.filter((r) => {
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
  }, [filtered, from, search, to]);

  const hasMatches = rows.length > 0;
  const hasRecords = filtered.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          className="border p-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          className="border p-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">
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
            className="w-full min-w-[12rem] rounded border border-gray-300 bg-white py-1 pl-8 pr-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Search income"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search income"
          />
        </div>
      </div>
      {!hasRecords ? (
        <EmptyState message="No income records found." />
      ) : !hasMatches ? (
        <EmptyState message="No income entries match your filters." />
      ) : (
        <table className="min-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-center">Evidence</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Notes</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t dark:border-gray-700">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.category || r.label || "—"}</td>
                <td className="p-2 text-center">
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
                <td className="p-2">{r.amount}</td>
                <td className="p-2">{r.notes}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      onClick={() => setEditingIncome(r)}
                      aria-label="Edit income"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M13.586 2.586a2 2 0 0 1 2.828 2.828l-.793.793-2.828-2.828.793-.793zM12.379 4.207 3 13.586V17h3.414l9.379-9.379-3.414-3.414z" />
                      </svg>
                      <span className="sr-only">Edit income</span>
                    </button>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                      onClick={() => {
                        if (confirm("are you sure?")) {
                          deleteMutation.mutate(r.id);
                        }
                      }}
                      aria-label="Delete income"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M8.5 3a1.5 1.5 0 0 1 3 0H15a1 1 0 1 1 0 2h-1v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5H5a1 1 0 1 1 0-2h3.5zM8 5v10h4V5H8z" />
                      </svg>
                      <span className="sr-only">Delete income</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState message="No income records found." />
      )}
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
      />
    </div>
  );
}
