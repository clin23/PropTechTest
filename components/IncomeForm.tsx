"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createIncome, listProperties } from "../lib/api";
import { useToast } from "./ui/use-toast";
import { INCOME_CATEGORIES } from "../lib/categories";
import type { PropertySummary } from "../types/property";

const humanize = (key: string) => key.replace(/([A-Z])/g, " $1").trim();

type FormState = {
  propertyId: string;
  date: string;
  group: string;
  category: string;
  amount: string;
  notes: string;
  label: string;
};

interface IncomeFormProps {
  propertyId?: string;
  onCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export default function IncomeForm({
  propertyId,
  onCreated,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: IncomeFormProps) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const getInitialForm = (): FormState => ({
    propertyId: propertyId ?? "",
    date: "",
    group: "",
    category: "",
    amount: "",
    notes: "",
    label: "",
  });
  const [form, setForm] = useState<FormState>(getInitialForm());
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setForm(getInitialForm());
  }, [propertyId]);

  useEffect(() => {
    if (!open) {
      setForm(getInitialForm());
      setError(null);
    }
  }, [open]);

  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const mutation = useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: any }) =>
      createIncome(propertyId, data),
    onSuccess: (_data, vars) => {
      toast({ title: "Income saved" });
      setOpen(false);
      setForm(getInitialForm());
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["income", vars.propertyId] });
      queryClient.invalidateQueries({ queryKey: ["pnl", vars.propertyId] });
      onCreated?.();
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : "Failed to save income";
      setError(message);
      toast({ title: "Failed to save income", description: message });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setForm(getInitialForm());
    setError(null);
  };

  const selectedIncomeOptions =
    form.group && form.group in INCOME_CATEGORIES
      ? INCOME_CATEGORIES[form.group as keyof typeof INCOME_CATEGORIES]
      : [];

  return (
    <div>
      {showTrigger && (
        <button
          className="px-2 py-1 bg-blue-500 text-white"
          onClick={() => setOpen(true)}
        >
          Add Income
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <form
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full max-w-md max-h-[90vh] p-4 space-y-2 overflow-y-auto rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              const targetPropertyId = propertyId ?? form.propertyId;
              if (!targetPropertyId || !form.date || !form.group || !form.amount) {
                setError("Please fill in all required fields");
                return;
              }
              if (!form.category && !form.label) {
                setError("Please select an income or enter a custom label");
                return;
              }
              if (form.category && form.label) {
                setError("Please choose either an income or a custom label");
                return;
              }
              if (isNaN(parseFloat(form.amount))) {
                setError("Amount must be a number");
                return;
              }
              mutation.mutate({
                propertyId: targetPropertyId,
                data: {
                  date: form.date,
                  category: form.category,
                  amount: parseFloat(form.amount),
                  notes: form.notes,
                  label: form.label,
                },
              });
            }}
          >
            {!propertyId && (
              <label className="block text-gray-700 dark:text-gray-300">
                Property
                <select
                  className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
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
                  setForm({
                    ...form,
                    group: e.target.value,
                    category: "",
                    label: "",
                  })
                }
              >
                <option value="">Select category</option>
                {Object.keys(INCOME_CATEGORIES).map((group) => (
                  <option key={group} value={group}>
                    {humanize(group)}
                  </option>
                ))}
              </select>
            </label>
            {form.group && (
              form.category === "" && form.label === "" ? (
                <div className="flex items-start gap-2">
                  <label className="block flex-1 text-gray-700 dark:text-gray-300">
                    Income
                    <select
                      className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value, label: "" })
                      }
                    >
                      <option value="">Select income</option>
                      {selectedIncomeOptions.map((item) => (
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
                      className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      value={form.label}
                      onChange={(e) =>
                        setForm({ ...form, label: e.target.value, category: "" })
                      }
                    />
                  </label>
                </div>
              ) : form.category !== "" ? (
                <label className="block text-gray-700 dark:text-gray-300">
                  Income
                  <select
                    className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value, label: "" })
                    }
                  >
                    <option value="">Select income</option>
                    {selectedIncomeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="block text-gray-700 dark:text-gray-300">
                  Custom label
                  <input
                    className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value, category: "" })
                    }
                  />
                </label>
              )
            )}
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
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
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
