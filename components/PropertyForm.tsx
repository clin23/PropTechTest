"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  exportPropertyData,
} from "../lib/api";
import type { PropertySummary } from "../types/property";
import { useToast } from "./ui/use-toast";
import { createPortal } from "react-dom";
import { downloadJson } from "../lib/download";

interface Props {
  property?: PropertySummary;
  onSaved?: (property: PropertySummary) => void;
  onCancel?: () => void;
  requireSlideConfirmation?: boolean;
}

const buildInitialFormState = (current?: PropertySummary) => ({
  address: current?.address ?? "",
  imageUrl: current?.imageUrl ?? "",
  tenant: current?.tenant ?? "",
  leaseStart: current?.leaseStart ?? "",
  leaseEnd: current?.leaseEnd ?? "",
  rent: current ? String(current.rent) : "",
});

export default function PropertyForm({
  property,
  onSaved,
  onCancel,
  requireSlideConfirmation = false,
}: Props) {
  const isEdit = !!property;
  const [form, setForm] = useState(() => buildInitialFormState(property));
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAddressInput, setDeleteAddressInput] = useState("");
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [confirmationProgress, setConfirmationProgress] = useState(0);
  const previousPropertyIdRef = useRef<string | null>(property?.id ?? null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const shouldRequireSlider = isEdit && requireSlideConfirmation;
  const isDirty = useMemo(
    () =>
      (Object.keys(form) as (keyof FormState)[]).some(
        (key) => form[key] !== baseSnapshotRef.current[key],
      ),
    [form],
  );
  const isConfirmed = !shouldRequireSlider || confirmationProgress >= 100;

  useEffect(() => {
    const nextPropertyId = property?.id ?? null;
    if (previousPropertyIdRef.current === nextPropertyId) {
      return;
    }

    previousPropertyIdRef.current = nextPropertyId;

    setForm({
      address: property?.address ?? "",
      imageUrl: property?.imageUrl ?? "",
      tenant: property?.tenant ?? "",
      leaseStart: property?.leaseStart ?? "",
      leaseEnd: property?.leaseEnd ?? "",
      rent: property ? String(property.rent) : "",
    });
    setDeleteAddressInput("");
    setDeleteModalOpen(false);
    setConfirmationProgress(0);
  }, [property]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  const handleFormFieldChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => {
      if (prev[field] === value) {
        return prev;
      }
      return { ...prev, [field]: value };
    });
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
    setDeleteAddressInput("");
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteAddressInput("");
  };

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? updateProperty(property!.id, payload)
        : createProperty(payload),
    onSuccess: (p: any) => {
      toast({ title: "Property saved" });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-nav"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["property", property!.id] });
        onSaved?.(p);
        if (!onSaved) {
          router.push(`/properties/${property!.id}`);
        }
      } else {
        router.push(`/properties/${p.id}`);
      }
      const nextSnapshot = createFormState(p);
      baseSnapshotRef.current = nextSnapshot;
      setForm(nextSnapshot);
      setConfirmationProgress(0);
    },
    onError: (e: any) =>
      toast({ title: "Failed to save property", description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProperty(property!.id),
    onSuccess: () => {
      toast({ title: "Property deleted" });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.removeQueries({ queryKey: ["property", property!.id] });
      router.push("/properties");
      closeDeleteModal();
    },
    onError: (e: any) =>
      toast({ title: "Failed to delete property", description: e.message }),
  });

  const handleDownloadData = async () => {
    if (!property) return;
    setIsDownloadingData(true);
    try {
      const data = await exportPropertyData(property.id);
      const baseName = property.address?.trim() || property.id;
      const slug = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const filename = `property-${slug || property.id}.json`;
      downloadJson(data, filename);
      toast({ title: "Property data downloaded" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to download property data";
      toast({
        title: "Failed to download property data",
        description: message,
      });
    } finally {
      setIsDownloadingData(false);
    }
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) {
      handleFormFieldChange("imageUrl", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        handleFormFieldChange("imageUrl", result);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmationTarget = (property?.address?.trim() || property?.id || "").trim();
  const deleteInputMatches =
    confirmationTarget.length > 0 &&
    deleteAddressInput.trim().toLowerCase() ===
      confirmationTarget.toLowerCase();
  const deleteDisabled = !deleteInputMatches || deleteMutation.isPending;
  const deleteButtonLabel = deleteMutation.isPending
    ? "Deleting..."
    : "Delete property";

  const handleSave = () => {
    if (saveMutation.isPending) return;
    if (shouldRequireSlider && !isConfirmed) return;
    saveMutation.mutate({
      address: form.address,
      imageUrl: form.imageUrl,
      tenant: form.tenant,
      leaseStart: form.leaseStart,
      leaseEnd: form.leaseEnd,
      rent: parseFloat(form.rent),
    });
  };

  return (
    <>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Address
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={form.address}
            onChange={(e) => handleFormFieldChange("address", e.target.value)}
          />
        </label>
        <label className="block">
          Property Image
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-100"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              handleImageUpload(file);
              // allow selecting the same file again if desired
              e.target.value = "";
            }}
          />
        </label>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div
            className="w-full overflow-hidden rounded border bg-gray-100 dark:border-gray-700 dark:bg-gray-800 md:w-[32rem]"
            style={{ aspectRatio: "16 / 9" }}
          >
            <img
              src={form.imageUrl || "/default-house.svg"}
              alt={form.address ? `Preview of ${form.address}` : "Property image preview"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>
              Upload a JPG or PNG image from your computer to replace the default property photo.
            </p>
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => handleImageUpload(null)}
                className="mt-2 inline-flex items-center rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Tenant
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={form.tenant}
            onChange={(e) => handleFormFieldChange("tenant", e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Lease Start
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={form.leaseStart}
              onChange={(e) => handleFormFieldChange("leaseStart", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Lease End
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={form.leaseEnd}
              onChange={(e) => handleFormFieldChange("leaseEnd", e.target.value)}
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Rent
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={form.rent}
            onChange={(e) => handleFormFieldChange("rent", e.target.value)}
          />
        </label>
        {shouldRequireSlider ? (
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm changes
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative flex h-12 w-full items-center overflow-hidden rounded-full bg-black text-white shadow-inner dark:bg-gray-900 sm:flex-1">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full transition-all duration-200 ease-out"
                    style={{
                      transformOrigin: "left center",
                      transform: `scaleX(${Math.min(Math.max(confirmationProgress, 0), 100) / 100})`,
                      background: isConfirmed
                        ? "#16a34a"
                        : "linear-gradient(90deg, #1e293b 0%, #16a34a 100%)",
                      opacity: confirmationProgress > 0 ? 1 : 0,
                      willChange: "transform, background",
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={confirmationProgress}
                    onChange={(e) => {
                      const nextValue = Number(e.target.value);
                      setConfirmationProgress(nextValue >= 96 ? 100 : nextValue);
                    }}
                    className="confirm-slider"
                    disabled={saveMutation.isPending}
                  />
                  <span
                    className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-xs font-semibold uppercase tracking-wide transition-colors ${
                      isConfirmed
                        ? "text-gray-900 dark:text-white"
                        : "text-white/80"
                    }`}
                  >
                    {isConfirmed ? "Confirmed" : "Slide right to confirm"}
                  </span>
                </div>
                <div className="flex shrink-0 justify-end gap-3">
                  {onCancel && (
                    <button
                      type="button"
                      className="h-12 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setConfirmationProgress(0);
                        onCancel();
                      }}
                      disabled={saveMutation.isPending}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    className="h-12 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                    onClick={handleSave}
                    disabled={saveMutation.isPending || !isConfirmed}
                  >
                    {saveMutation.isPending ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
            {isEdit && (
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                  onClick={openDeleteModal}
                  disabled={deleteMutation.isPending || saveMutation.isPending}
                >
                  Delete property
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Saving will immediately update this property for all users.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                onClick={onCancel}
                disabled={saveMutation.isPending}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : isEdit ? "Save" : "Create"}
            </button>
          </div>
        )}
      </form>
      {isEdit && deleteModalOpen &&
        portalTarget &&
        createPortal(
          <div
            key="property-delete-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={closeDeleteModal}
          >
            <div
              className="w-full max-w-lg rounded-md bg-white p-4 shadow-lg dark:bg-gray-800 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold">Delete property</h2>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Deleting this property will permanently remove all existing information
                including income, expenses, records, tasks, and related notes. Are you
                sure?
              </p>
              <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100">
                <p className="mb-2">
                  We recommend downloading a copy of this property's data before
                  deleting it.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center rounded border border-amber-400 px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-400/60 dark:text-amber-50 dark:hover:bg-amber-500/20"
                  onClick={handleDownloadData}
                  disabled={isDownloadingData}
                >
                  {isDownloadingData ? "Preparing download..." : "Download all data"}
                </button>
              </div>
              <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type the property address to confirm
                <input
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={deleteAddressInput}
                  onChange={(e) => setDeleteAddressInput(e.target.value)}
                  placeholder={confirmationTarget}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter <span className="font-semibold text-gray-700 dark:text-gray-200">{confirmationTarget}</span> to proceed.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded border border-gray-300 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  onClick={closeDeleteModal}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteDisabled}
                >
                  {deleteButtonLabel}
                </button>
              </div>
            </div>
          </div>,
          portalTarget,
        )}
    </>
  );
}

