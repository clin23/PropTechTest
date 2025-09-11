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
          className="border p-1 w-full"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </label>
      <label className="block">
        Image URL
        <input
          className="border p-1 w-full"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </label>
      <label className="block">
        Tenant
        <input
          className="border p-1 w-full"
          value={form.tenant}
          onChange={(e) => setForm({ ...form, tenant: e.target.value })}
        />
      </label>
      <label className="block">
        Lease Start
        <input
          type="date"
          className="border p-1 w-full"
          value={form.leaseStart}
          onChange={(e) => setForm({ ...form, leaseStart: e.target.value })}
        />
      </label>
      <label className="block">
        Lease End
        <input
          type="date"
          className="border p-1 w-full"
          value={form.leaseEnd}
          onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })}
        />
      </label>
      <label className="block">
        Rent
        <input
          type="number"
          className="border p-1 w-full"
          value={form.rent}
          onChange={(e) => setForm({ ...form, rent: e.target.value })}
        />
      </label>
      <div className="space-x-2">
        <button type="submit" className="px-2 py-1 bg-blue-500 text-white">
          {isEdit ? "Save" : "Create"}
        </button>
        {isEdit && (
          <button
            type="button"
            className="px-2 py-1 bg-red-500 text-white"
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

