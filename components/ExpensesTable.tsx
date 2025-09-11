"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listExpenses, deleteExpense, listProperties } from "../lib/api";
import type { ExpenseRow } from "../types/expense";
import type { PropertySummary } from "../types/property";
import EmptyState from "./EmptyState";

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
                  <button
                    className="text-red-600 underline dark:text-red-400"
                    onClick={() => {
                      if (confirm("Delete this expense?")) {
                        deleteMutation.mutate(r.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState message="No expenses found." />
      )}
    </div>
  );
}
