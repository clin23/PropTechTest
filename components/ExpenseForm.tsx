"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { createExpense, listProperties, uploadExpenseReceipt } from "../lib/api";
import { logEvent } from "../lib/log";
import { useToast } from "./ui/use-toast";
import ModalPortal from "./ModalPortal";
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
  receipt: File | null;
};


interface Props {
  propertyId?: string;
  onCreated?: () => void;
  onSaved?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaults?: Partial<FormState>;
  showTrigger?: boolean;
  mode?: "create" | "edit";
  expenseId?: string;
}

export default function ExpenseForm({
  propertyId,
  onCreated,
  onSaved,
  open: controlledOpen,
  onOpenChange,
  defaults,
  showTrigger = true,
  mode = "create",
  expenseId,
}: Props) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const isEditMode = mode === "edit" && Boolean(expenseId);

  const computeInitialForm = useCallback((): FormState => {
    const typedDefaults = (defaults ?? {}) as Partial<FormState> & {
      amount?: string | number;
      gst?: string | number;
    };

    const coerceString = (value: unknown): string =>
      value === undefined || value === null ? "" : String(value);

    const rawGroup =
      typeof typedDefaults.group === "string" ? typedDefaults.group : "";
    const configuredGroup =
      rawGroup && rawGroup in EXPENSE_CATEGORIES ? rawGroup : "";

    const categoryValue = coerceString(typedDefaults.category);
    const derivedGroup =
      configuredGroup ||
      (categoryValue
        ? Object.entries(EXPENSE_CATEGORIES).find(([, items]) =>
            items.includes(categoryValue)
          )?.[0] ?? ""
        : "");

    const defaultCategory =
      derivedGroup && categoryValue
        ? EXPENSE_CATEGORIES[derivedGroup]?.includes(categoryValue)
          ? categoryValue
          : ""
        : "";

    const defaultLabel = (() => {
      if (defaultCategory) {
        return "";
      }
      const providedLabel = coerceString(typedDefaults.label);
      if (providedLabel) {
        return providedLabel;
      }
      if (categoryValue) {
        return categoryValue;
      }
      return "";
    })();

    return {
      propertyId: coerceString(propertyId ?? typedDefaults.propertyId),
      date: coerceString(typedDefaults.date),
      group: derivedGroup,
      category: defaultCategory,
      vendor: coerceString(typedDefaults.vendor),
      amount: coerceString(typedDefaults.amount),
      gst: coerceString(typedDefaults.gst),
      notes: coerceString(typedDefaults.notes),
      label: defaultLabel,
      receipt: null,
    };
  }, [defaults, propertyId]);

  const [form, setForm] = useState<FormState>(computeInitialForm);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [recent, setRecent] = useState<string[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

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
    if (!open) return;
    setForm(computeInitialForm());
    setError(null);
    setFileInputKey((key) => key + 1);
  }, [open, computeInitialForm]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);


  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const mutation = useMutation({
    mutationFn: async (
      payload: {
        expense: {
          propertyId: string;
          date: string;
          category: string;
          vendor?: string;
          amount: number;
          gst: number;
          notes?: string;
          label?: string;
        };
        receipt?: File | null;
      }
    ) => {
      const created = await createExpense(payload.expense);
      if (payload.receipt) {
        const { url } = await uploadExpenseReceipt(created.id, payload.receipt);
        return { ...created, receiptUrl: url };
      }
      return created;
    },
    onSuccess: () => {
      toast({ title: isEditMode ? "Expense updated" : "Expense saved" });
      setOpen(false);
      setForm(computeInitialForm());
      setError(null);
      setFileInputKey((key) => key + 1);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onCreated?.();
      onSaved?.();
      if (!isEditMode) {
        logEvent("expense_create", {
          propertyId: form.propertyId,
          amount: parseFloat(form.amount),
        });
      }
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : "Failed to save expense";
      setError(message);
      toast({ title: "Failed to save expense", description: message });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setForm(computeInitialForm());
    setError(null);
    setFileInputKey((key) => key + 1);
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

      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="expense-modal"
                className="fixed inset-0 z-50 flex h-full w-full items-start justify-center bg-black/50 p-4 sm:p-6 md:items-center"
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.form
                  className="h-full w-full max-w-2xl max-h-full space-y-3 overflow-y-auto rounded-lg bg-white p-6 text-gray-900 shadow-lg dark:bg-gray-800 dark:text-gray-100"
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
                      expense: {
                        propertyId: form.propertyId,
                        date: form.date,
                        category: form.category,
                        vendor: form.vendor,
                        amount: parseFloat(form.amount),
                        gst: form.gst ? parseFloat(form.gst) : 0,
                        notes: form.notes,
                        label: form.label,
                      },
                      receipt: form.receipt,
                    });
                    if (form.group) {
                      addRecent(form.group);
                    }
                  }}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Log an Expense
                  </h2>
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
                form.category === "" && form.label === "" ? (
                  <div className="flex items-start gap-2">
                    <label className="block flex-1 text-gray-700 dark:text-gray-300">
                      Expense
                      <select
                        className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value, label: "" })
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
                    Expense
                    <select
                      className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value, label: "" })
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
              <label className="block text-gray-700 dark:text-gray-300">
                Receipt
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      receipt: e.target.files && e.target.files[0]
                        ? e.target.files[0]
                        : null,
                    })
                  }
                />
                {form.receipt && (
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {form.receipt.name}
                  </div>
                )}
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
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>,
      portalTarget,
    )}
  </div>
  );
}
