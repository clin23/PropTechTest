"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIncome,
  listProperties,
  updateIncome,
  uploadFile,
} from "../lib/api";
import { useToast } from "./ui/use-toast";
import { INCOME_CATEGORIES } from "../lib/categories";
import type { PropertySummary } from "../types/property";
import type { IncomeRow } from "../types/income";

const humanize = (key: string) => key.replace(/([A-Z])/g, " $1").trim();

const findGroupForCategory = (category: string) => {
  if (!category) return "";
  const match = Object.entries(INCOME_CATEGORIES).find(([, values]) =>
    values.includes(category)
  );
  return match ? match[0] : "";
};

type FormState = {
  propertyId: string;
  date: string;
  group: string;
  category: string;
  amount: string;
  notes: string;
  label: string;
  evidenceUrl: string;
  evidenceName: string;
};

interface IncomeFormProps {
  propertyId?: string;
  onCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  initialIncome?: IncomeRow | null;
}

export default function IncomeForm({
  propertyId,
  onCreated,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
  initialIncome = null,
}: IncomeFormProps) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const isEditing = Boolean(initialIncome);
  const getInitialForm = useCallback((): FormState => {
    if (initialIncome) {
      const group = initialIncome.category
        ? findGroupForCategory(initialIncome.category)
        : initialIncome.label
        ? "Other"
        : "";
      return {
        propertyId: propertyId ?? initialIncome.propertyId,
        date: initialIncome.date ?? "",
        group,
        category: initialIncome.category ?? "",
        amount:
          typeof initialIncome.amount === "number"
            ? initialIncome.amount.toString()
            : "",
        notes: initialIncome.notes ?? "",
        label: initialIncome.label ?? "",
        evidenceUrl: initialIncome.evidenceUrl ?? "",
        evidenceName: initialIncome.evidenceName ?? "",
      };
    }
    return {
      propertyId: propertyId ?? "",
      date: "",
      group: "",
      category: "",
      amount: "",
      notes: "",
      label: "",
      evidenceUrl: "",
      evidenceName: "",
    };
  }, [initialIncome, propertyId]);
  const [form, setForm] = useState<FormState>(getInitialForm());
  const [error, setError] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setForm(getInitialForm());
    setEvidenceFile(null);
  }, [getInitialForm]);

  useEffect(() => {
    if (!open) {
      setForm(getInitialForm());
      setEvidenceFile(null);
      setError(null);
    }
  }, [getInitialForm, open]);

  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const mutation = useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: any }) =>
      isEditing && initialIncome
        ? updateIncome(propertyId, initialIncome.id, data)
        : createIncome(propertyId, data),
    onSuccess: (_data, vars) => {
      toast({ title: "Income saved" });
      setOpen(false);
      setForm(getInitialForm());
      setEvidenceFile(null);
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
    setEvidenceFile(null);
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

      <AnimatePresence>
        {open && (
          <motion.div
            key="income-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.form
              className="w-full max-w-md max-h-[90vh] space-y-2 overflow-y-auto rounded-lg bg-white p-4 text-gray-900 shadow-lg dark:bg-gray-900 dark:text-gray-100"
              onClick={(e) => e.stopPropagation()}
              onSubmit={async (e) => {
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

                let evidenceUrl = form.evidenceUrl;
                let evidenceName = form.evidenceName;
                if (evidenceFile) {
                  try {
                    const upload = await uploadFile(evidenceFile);
                    evidenceUrl = upload.url;
                    evidenceName = evidenceFile.name;
                  } catch (err: any) {
                    const message =
                      err instanceof Error ? err.message : "Failed to upload evidence";
                    setError(message);
                    toast({ title: "Failed to upload evidence", description: message });
                    return;
                  }
                }

                const shouldRemoveExistingEvidence =
                  !evidenceFile && !evidenceUrl && !!initialIncome?.evidenceUrl;

                mutation.mutate({
                  propertyId: targetPropertyId,
                  data: {
                    date: form.date,
                    category: form.category,
                    amount: parseFloat(form.amount),
                    notes: form.notes,
                    label: form.label,
                    evidenceUrl: shouldRemoveExistingEvidence
                      ? null
                      : evidenceUrl || undefined,
                    evidenceName: shouldRemoveExistingEvidence
                      ? null
                      : evidenceName || undefined,
                  },
                });
              }}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Log Income
              </h2>
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
                  className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 disabled:opacity-70"
                  value={form.group}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      group: e.target.value,
                      category: "",
                      label: "",
                    })
                  }
                  disabled={isEditing}
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
              <div className="space-y-1">
                <label className="block text-gray-700 dark:text-gray-300">
                  Evidence
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-100"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setEvidenceFile(file);
                      if (file) {
                        setForm({
                          ...form,
                          evidenceName: file.name,
                        });
                      }
                    }}
                  />
                </label>
                {(evidenceFile || form.evidenceUrl) && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {evidenceFile ? (
                      <span>Selected: {evidenceFile.name}</span>
                    ) : (
                      form.evidenceUrl && (
                        <a
                          href={form.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-500 dark:text-blue-300"
                        >
                          {form.evidenceName || "View current evidence"}
                        </a>
                      )
                    )}
                    {(form.evidenceUrl || evidenceFile) && (
                      <button
                        type="button"
                        className="rounded border border-transparent bg-transparent px-2 py-1 text-xs text-red-600 hover:underline dark:text-red-400"
                        onClick={() => {
                          setEvidenceFile(null);
                          setForm({
                            ...form,
                            evidenceUrl: "",
                            evidenceName: "",
                          });
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
              <label className="block text-gray-700 dark:text-gray-300">
                Notes
                <textarea
                  className="border p-1 w-full rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded bg-gray-100 px-2 py-1 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
