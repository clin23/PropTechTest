"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createInspection } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function InspectionCreateModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    propertyId: "",
    type: "Entry",
    date: "",
    inspector: "",
    template: "Default",
  });

  const mutation = useMutation({
    mutationFn: () =>
      createInspection({
        propertyId: form.propertyId,
        type: form.type,
        status: "Scheduled",
        date: form.date,
        inspector: form.inspector,
        template: form.template,
      }),
    onSuccess: () => {
      onCreated?.();
      onClose();
      setForm({ propertyId: "", type: "Entry", date: "", inspector: "", template: "Default" });
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form
        className="bg-white p-4 rounded space-y-2 w-80"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <label className="block text-sm">
          Property
          <input
            className="border p-1 w-full"
            value={form.propertyId}
            onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Type
          <select
            className="border p-1 w-full"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Entry</option>
            <option>Routine</option>
            <option>Exit</option>
          </select>
        </label>
        <label className="block text-sm">
          Date/Time
          <input
            type="datetime-local"
            className="border p-1 w-full"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Inspector
          <input
            className="border p-1 w-full"
            value={form.inspector}
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Template
          <select
            className="border p-1 w-full"
            value={form.template}
            onChange={(e) => setForm({ ...form, template: e.target.value })}
          >
            <option>Default</option>
            <option>Detailed</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="px-2 py-1 bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="px-2 py-1 bg-blue-600 text-white">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

