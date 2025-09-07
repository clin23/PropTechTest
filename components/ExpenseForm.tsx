"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, listProperties } from "../lib/api";
import { useToast } from "./ui/use-toast";
import type { PropertySummary } from "../types/property";

interface Props {
  propertyId?: string;
  onCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export default function ExpenseForm({
  propertyId,
  onCreated,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: Props) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [form, setForm] = useState({
    propertyId: propertyId ?? "",
    date: "",
    category: "",
    vendor: "",
    amount: "",
    gst: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => createExpense(payload),
    onSuccess: () => {
      toast({ title: "Expense saved" });
      setOpen(false);
      setForm({
        propertyId: propertyId ?? "",
        date: "",
        category: "",
        vendor: "",
        amount: "",
        gst: "",
        notes: "",
      });
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onCreated?.();
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : "Failed to save expense";
      setError(message);
      toast({ title: "Failed to save expense", description: message });
    },
  });

  return (
    <div>
      {showTrigger && (
        <button
          className="px-2 py-1 bg-blue-500 text-white"
          onClick={() => setOpen(true)}
        >
          Add Expense
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-end">
          <form
            className="bg-white w-96 h-full p-4 space-y-2 overflow-y-auto"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (
                !form.propertyId ||
                !form.date ||
                !form.category ||
                !form.vendor ||
                !form.amount
              ) {
                setError("Please fill in all required fields");
                return;
              }
              if (isNaN(parseFloat(form.amount))) {
                setError("Amount must be a number");
                return;
              }
              mutation.mutate({
                propertyId: form.propertyId,
                date: form.date,
                category: form.category,
                vendor: form.vendor,
                amount: parseFloat(form.amount),
                gst: form.gst ? parseFloat(form.gst) : 0,
                notes: form.notes,
              });
            }}
          >
            {!propertyId && (
              <label className="block">
                Property
                <select
                  className="border p-1 w-full"
                  value={form.propertyId}
                  onChange={(e) =>
                    setForm({ ...form, propertyId: e.target.value })
                  }
                >
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
              Vendor
              <input
                className="border p-1 w-full"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
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
              GST
              <input
                type="number"
                className="border p-1 w-full"
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
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
