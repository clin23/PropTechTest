"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listExpenses, deleteExpense, listProperties } from "../lib/api";
import type { ExpenseRow } from "../types/expense";
import type { PropertySummary } from "../types/property";
import EmptyState from "./EmptyState";
import ExpenseForm from "./ExpenseForm";

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
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);

  const params = {
    propertyId: propertyId ?? (property || undefined),
    from: from || undefined,
    to: to || undefined,
    category: category || undefined,
    vendor: vendor || undefined,
  };
  const queryKey = [
    "expenses",
    params.propertyId || "",
    from,
    to,
    category,
    vendor,
  ];
  const { data = [] } = useQuery<ExpenseRow[]>({
    queryKey,
    queryFn: () => listExpenses(params),
  });

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

  const propertyMap = Object.fromEntries(
    properties.map((p) => [p.id, p.address])
  );

  const iconButtonClass =
    "rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";

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

  const handleEdit = (expense: ExpenseRow) => {
    setEditingExpense(expense);
    setEditOpen(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {!propertyId && (
          <select
            className="border p-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
        <input
          className="border p-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className="border p-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />
      </div>
      {data.length ? (
        <table className="min-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {!propertyId && <th className="p-2 text-left">Property</th>}
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">GST</th>
              <th className="p-2 text-left">Notes</th>
              <th className="p-2 text-left">Receipt</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-t dark:border-gray-700">
                {!propertyId && (
                  <td className="p-2">{propertyMap[r.propertyId] || r.propertyId}</td>
                )}
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.category}</td>
                <td className="p-2">{r.vendor}</td>
                <td className="p-2">{r.amount}</td>
                <td className="p-2">{r.gst}</td>
                <td className="p-2">{r.notes}</td>
                <td className="p-2">{r.receiptUrl && <span>📎</span>}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={iconButtonClass}
                      onClick={() => handleEdit(r)}
                      aria-label="Edit expense"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M17.414 2.586a2 2 0 0 0-2.828 0l-1.086 1.086 2.828 2.828 1.086-1.086a2 2 0 0 0 0-2.828ZM14.5 7.5 11.672 4.672 4 12.343V15.5h3.157L14.5 7.5Z" />
                        <path d="M2 6a2 2 0 0 1 2-2h4a1 1 0 1 1 0 2H4v10h10v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`${iconButtonClass} text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300`}
                      onClick={() => {
                        if (confirm("are you sure?")) {
                          deleteMutation.mutate(r.id);
                        }
                      }}
                      aria-label="Delete expense"
                      disabled={deleteMutation.isPending}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 3a1.75 1.75 0 0 0-1.744 1.602l-.035.348H4a.75.75 0 0 0 0 1.5h.532l.634 9.182A2.25 2.25 0 0 0 7.41 17.75h5.18a2.25 2.25 0 0 0 2.244-2.118L15.468 6.45H16a.75.75 0 0 0 0-1.5h-2.97l-.035-.348A1.75 1.75 0 0 0 11.25 3h-2.5ZM9.75 7a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V7Zm2.75-.75a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState message="No expenses found." />
      )}
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
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey });
        }}
      />
    </div>
  );
}
