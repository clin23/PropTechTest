"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createExpense } from "../lib/api";

export default function ExpenseForm({
  propertyId,
  onCreated,
}: {
  propertyId: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", category: "", amount: "" });

  const mutation = useMutation({
    mutationFn: (payload: any) => createExpense(propertyId, payload),
    onSuccess: () => {
      setOpen(false);
      setForm({ date: "", category: "", amount: "" });
      onCreated?.();
    },
  });

  return (
    <div>
      <button
        className="px-2 py-1 bg-blue-500 text-white"
        onClick={() => setOpen(true)}
      >
        Add Expense
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            className="bg-white p-4 rounded space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({
                date: form.date,
                category: form.category,
                amount: parseFloat(form.amount),
              });
            }}
          >
            <label className="block">
              Date
              <input
                type="date"
                className="border p-1 w-full"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="block">
              Category
              <input
                className="border p-1 w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>
            <label className="block">
              Amount
              <input
                type="number"
                className="border p-1 w-full"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-2 py-1 bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 bg-green-500 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
