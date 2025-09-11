"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, listProperties } from "../lib/api";
import { logEvent } from "../lib/log";
import { useToast } from "./ui/use-toast";
import type { PropertySummary } from "../types/property";
import { EXPENSE_CATEGORIES } from "../lib/categories";

const humanize = (key: string) => key.replace(/([A-Z])/g, " $1").trim();
type FormState = {
  propertyId: string;
  date: string;
  group: string;
  category: string;
  vendor: string;
  amount: string;
  gst: string;
  notes: string;
  label: string;
};


interface Props {
  propertyId?: string;
  onCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaults?: Partial<FormState>;
  showTrigger?: boolean;
}

export default function ExpenseForm({
  propertyId,
  onCreated,
  open: controlledOpen,
  onOpenChange,
  defaults,
  showTrigger = true,
}: Props) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const getInitialForm = (): FormState => {
    const defaultCategory = defaults?.category ?? "";
    const foundGroup = Object.entries(EXPENSE_CATEGORIES).find(([g, items]) =>
      items.includes(defaultCategory)
    )?.[0];
    return {
      propertyId: propertyId ?? (defaults?.propertyId ?? ""),
      date: defaults?.date ?? "",
      group: foundGroup ?? "",
      category: defaultCategory,
      vendor: defaults?.vendor ?? "",
      amount: defaults?.amount !== undefined ? String(defaults.amount) : "",
      gst: defaults?.gst !== undefined ? String(defaults.gst) : "",
      notes: defaults?.notes ?? "",
      label: (defaults as any)?.label ?? "",
    };
  };

  const [form, setForm] = useState<FormState>(getInitialForm());
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentExpenseCategories");
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      setRecent(parsed.filter((cat) => cat in EXPENSE_CATEGORIES));
    }
  }, []);

  const addRecent = (cat: string) => {
    setRecent((prev) => {
      const next = [cat, ...prev.filter((c) => c !== cat)].slice(0, 5);
      localStorage.setItem("recentExpenseCategories", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    setForm(getInitialForm());
  }, [propertyId, defaults, open]);


  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => createExpense(payload),
    onSuccess: () => {
      toast({ title: "Expense saved" });
      setOpen(false);
      setForm(getInitialForm());
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onCreated?.();
      logEvent("expense_create", {
        propertyId: form.propertyId,
        amount: parseFloat(form.amount),
      });
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : "Failed to save expense";
      setError(message);
      toast({ title: "Failed to save expense", description: message });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setForm(getInitialForm());
    setError(null);
  };

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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={handleClose}
        >
          <form
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full max-w-md p-4 space-y-2 rounded-lg shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (
                !form.propertyId ||
                !form.date ||
                !form.group ||
                !form.vendor ||
                !form.amount ||
                (!form.category && !form.label)
              ) {
                setError("Please fill in all required fields");
                return;
              }
              if (form.category && form.label) {
                setError("Please choose either an expense or a custom label");
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
                label: form.label,
              });
              addRecent(form.group);
            }}
          >
            {!propertyId && (
              <label className="block text-gray-700 dark:text-gray-300">
                Property
                <select
                  className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
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
            <label className="block text-gray-700 dark:text-gray-300">
              Date
              <input
                type="date"
                className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="block text-gray-700 dark:text-gray-300">
              Category
              <select
                className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.group}
                onChange={(e) =>
                  setForm({ ...form, group: e.target.value, category: "" })
                }
              >
                <option value="">Select category</option>
                {recent.length > 0 && (
                  <optgroup label="Recent">
                    {recent.map((cat) => (
                      <option key={cat} value={cat}>
                        {humanize(cat)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {Object.keys(EXPENSE_CATEGORIES).map((group) => (
                  <option key={group} value={group}>
                    {humanize(group)}
                  </option>
                ))}
              </select>
            </label>
            {form.group && (
              <div className="flex items-end gap-2">
                <label className="block flex-1 text-gray-700 dark:text-gray-300">
                  Expense
                  <select
                    className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                    value={form.category}
                    disabled={form.label.trim() !== ""}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select expense</option>
                    {EXPENSE_CATEGORIES[form.group].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="self-center text-gray-500">OR</span>
                <label className="block flex-1 text-gray-700 dark:text-gray-300">
                  Custom label
                  <input
                    className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                    value={form.label}
                    disabled={form.category !== ""}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </label>
              </div>
            )}
            {!form.group && (
              <label className="block text-gray-700 dark:text-gray-300">
                Custom label
                <input
                  className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </label>
            )}
            <label className="block text-gray-700 dark:text-gray-300">
              Vendor
              <input
                className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              />
            </label>
            <label className="block text-gray-700 dark:text-gray-300">
              Amount
              <input
                type="number"
                className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </label>
            <label className="block text-gray-700 dark:text-gray-300">
              GST
              <input
                type="number"
                className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
              />
            </label>
            <label className="block text-gray-700 dark:text-gray-300">
              Notes
              <textarea
                className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 bg-green-500 text-white rounded"
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
