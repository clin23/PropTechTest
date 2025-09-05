"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listExpenses } from "../lib/api";

export interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  amount: number;
}

export default function ExpensesTable({ propertyId }: { propertyId: string }) {
  const { data = [] } = useQuery<ExpenseRow[]>({
    queryKey: ["expenses", propertyId],
    queryFn: () => listExpenses(propertyId),
  });
  const [filter, setFilter] = useState("");

  const rows = data.filter((r) =>
    r.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        className="border p-1"
        placeholder="Filter by category"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.category}</td>
              <td className="p-2">{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
