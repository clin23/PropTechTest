"use client";

import PropertyForm from "./PropertyForm";
import type { PropertySummary } from "../types/property";

interface Props {
  open: boolean;
  property: PropertySummary;
  onClose: () => void;
}

export default function PropertyEditModal({ open, property, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium mb-2">Edit Property</h2>
        <PropertyForm property={property} onSaved={onClose} />
      </div>
    </div>
  );
}

