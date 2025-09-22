"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listIncome, deleteIncome } from "../lib/api";
import type { IncomeRow } from "../types/income";
import EmptyState from "./EmptyState";

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
  const [category, setCategory] = useState("");

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

  const rows = filtered.filter((r) => {
    const afterFrom = from ? new Date(r.date) >= new Date(from) : true;
    const beforeTo = to ? new Date(r.date) <= new Date(to) : true;
    const categoryMatch = category
      ? r.category.toLowerCase().includes(category.toLowerCase())
      : true;
    return afterFrom && beforeTo && categoryMatch;
  });

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
        <input
          className="border p-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      {rows.length ? (
        <table className="min-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Notes</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t dark:border-gray-700">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.category}</td>
                <td className="p-2">{r.amount}</td>
                <td className="p-2">{r.notes}</td>
                <td className="p-2">
                  <button
                    className="text-red-600 underline dark:text-red-400"
                    onClick={() => {
                      if (confirm("Delete this income?")) {
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
        <EmptyState message="No income records found." />
      )}
    </div>
  );
}
