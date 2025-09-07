"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncome } from "../lib/api";
import { useToast } from "./ui/use-toast";
import { INCOME_CATEGORIES } from "../lib/categories";

interface IncomeFormProps {
  propertyId: string;
  onCreated?: () => void;
}

export default function IncomeForm({
  propertyId,
  onCreated,
}: IncomeFormProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", category: "", amount: "", notes: "", label: "" });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: any) => createIncome(propertyId, payload),
    onSuccess: () => {
      toast({ title: "Income saved" });
      setOpen(false);
      setForm({ date: "", category: "", amount: "", notes: "", label: "" });
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["income", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["pnl", propertyId] });
      onCreated?.();
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : "Failed to save income";
      setError(message);
      toast({ title: "Failed to save income", description: message });
    },
  });

  return (
    <div>
      <button className="px-2 py-1 bg-blue-500 text-white" onClick={() => setOpen(true)}>
        Add Income
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-end">
          <form
            className="bg-white w-96 h-full p-4 space-y-2 overflow-y-auto"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (!form.date || !form.category || !form.amount) {
                setError("Please fill in all required fields");
                return;
              }
              if (isNaN(parseFloat(form.amount))) {
                setError("Amount must be a number");
                return;
              }
              mutation.mutate({
                date: form.date,
                category: form.category,
                amount: parseFloat(form.amount),
                notes: form.notes,
                label: form.label,
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
              <select
                className="border p-1 w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {Object.entries(INCOME_CATEGORIES).map(([group, items]) => (
                  <optgroup
                    key={group}
                    label={group.replace(/([A-Z])/g, " $1").trim()}
                  >
                    {items.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
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
            <label className="block">
              Custom label
              <input
                className="border p-1 w-full"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </label>
            <label className="block">
              Notes
              <textarea
                className="border p-1 w-full"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-2 py-1 bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="px-2 py-1 bg-green-500 text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
