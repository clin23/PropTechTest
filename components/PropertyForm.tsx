"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProperty, updateProperty, deleteProperty } from "../lib/api";
import type { PropertySummary } from "../types/property";
import { useToast } from "./ui/use-toast";

interface Props {
  property?: PropertySummary;
  onSaved?: (property: PropertySummary) => void;
}

export default function PropertyForm({ property, onSaved }: Props) {
  const isEdit = !!property;
  const [form, setForm] = useState({
    address: property?.address ?? "",
    imageUrl: property?.imageUrl ?? "",
    tenant: property?.tenant ?? "",
    leaseStart: property?.leaseStart ?? "",
    leaseEnd: property?.leaseEnd ?? "",
    rent: property ? String(property.rent) : "",
  });
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? updateProperty(property!.id, payload)
        : createProperty(payload),
    onSuccess: (p: any) => {
      toast({ title: "Property saved" });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["property", property!.id] });
        onSaved?.(p);
        if (!onSaved) {
          router.push(`/properties/${property!.id}`);
        }
      } else {
        router.push(`/properties/${p.id}`);
      }
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
    },
    onError: (e: any) =>
      toast({ title: "Failed to delete property", description: e.message }),
  });

  const handleImageUpload = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, imageUrl: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate({
          address: form.address,
          imageUrl: form.imageUrl,
          tenant: form.tenant,
          leaseStart: form.leaseStart,
          leaseEnd: form.leaseEnd,
          rent: parseFloat(form.rent),
        });
      }}
    >
      <label className="block">
        Address
        <input
          className="border p-1 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
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
      <div className="flex items-center gap-4">
        <div className="h-24 w-32 overflow-hidden rounded border bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
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
      <label className="block">
        Tenant
        <input
          className="border p-1 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={form.tenant}
          onChange={(e) => setForm({ ...form, tenant: e.target.value })}
        />
      </label>
      <label className="block">
        Lease Start
        <input
          type="date"
          className="border p-1 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={form.leaseStart}
          onChange={(e) => setForm({ ...form, leaseStart: e.target.value })}
        />
      </label>
      <label className="block">
        Lease End
        <input
          type="date"
          className="border p-1 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={form.leaseEnd}
          onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })}
        />
      </label>
      <label className="block">
        Rent
        <input
          type="number"
          className="border p-1 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={form.rent}
          onChange={(e) => setForm({ ...form, rent: e.target.value })}
        />
      </label>
      {isEdit && (
        <label className="block">
          Type 'confirm' to save changes
          <input
            className="border p-1 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
      )}
      <div className="space-x-2">
        <button
          type="submit"
          className="px-2 py-1 bg-blue-500 text-white dark:bg-blue-600 disabled:opacity-50"
          disabled={isEdit && confirm !== "confirm"}
        >
          {isEdit ? "Save" : "Create"}
        </button>
        {isEdit && (
          <button
            type="button"
            className="px-2 py-1 bg-red-500 text-white dark:bg-red-600"
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

