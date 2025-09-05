"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "next/navigation";
import { listExpenses } from "../lib/api";

export interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  vendor: string;
  amount: number;
  gst: number;
  notes?: string;
  receiptUrl?: string;
}

export default function ExpensesTable() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data = [] } = useQuery<ExpenseRow[]>({
    queryKey: ["expenses", propertyId],
    queryFn: () => listExpenses(propertyId),
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");

  const rows = data.filter((r) => {
    const afterFrom = from ? new Date(r.date) >= new Date(from) : true;
    const beforeTo = to ? new Date(r.date) <= new Date(to) : true;
    const categoryMatch = category
      ? r.category.toLowerCase().includes(category.toLowerCase())
      : true;
    const vendorMatch = vendor
      ? r.vendor.toLowerCase().includes(vendor.toLowerCase())
      : true;
    return afterFrom && beforeTo && categoryMatch && vendorMatch;
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          className="border p-1"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          className="border p-1"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />
        <input
          className="border p-1"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className="border p-1"
          placeholder="Vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />
      </div>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Vendor</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">GST</th>
            <th className="p-2 text-left">Notes</th>
            <th className="p-2 text-left">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.category}</td>
              <td className="p-2">{r.vendor}</td>
              <td className="p-2">{r.amount}</td>
              <td className="p-2">{r.gst}</td>
              <td className="p-2">{r.notes}</td>
              <td className="p-2">
                {r.receiptUrl && (
                  <a
                    href={r.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
