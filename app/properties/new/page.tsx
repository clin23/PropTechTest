"use client";

import PropertyForm from "../../../components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Add Property</h1>
      <PropertyForm />
    </div>
  );
}

