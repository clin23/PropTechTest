"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createIncome } from "../lib/api";
import { useToast } from "./ui/use-toast";

export default function IncomeForm({ onCreated }: { onCreated?: () => void }) {
  const { propertyId } = useParams<{ propertyId: string }>();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", source: "", amount: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: any) => createIncome(propertyId, payload),
    onSuccess: () => {
      toast({ title: "Income saved" });
      setOpen(false);
      setForm({ date: "", source: "", amount: "", notes: "" });
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
              if (!form.date || !form.source || !form.amount) {
                setError("Please fill in all required fields");
                return;
              }
              if (isNaN(parseFloat(form.amount))) {
                setError("Amount must be a number");
                return;
              }
              mutation.mutate({
                date: form.date,
                source: form.source,
                amount: parseFloat(form.amount),
                notes: form.notes,
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
              Source
              <input
                className="border p-1 w-full"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
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
