"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PhotoUpload from "./PhotoUpload";
import { createListing, generateListingCopy, exportListingPack } from "../lib/api";

interface FormState {
  property: string;
  photos: File[];
  features: string;
  rent: string;
  description: string;
}

export default function ListingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    property: "",
    photos: [],
    features: "",
    rent: "",
    description: "",
  });
  const [adCopy, setAdCopy] = useState("");
  const [listingId, setListingId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      createListing({
        property: form.property,
        photos: form.photos.map((f) => f.name),
        features: form.features,
        rent: parseFloat(form.rent),
        description: adCopy || form.description,
      }),
    onSuccess: (data: any) => setListingId(data.id),
  });

  const copyMutation = useMutation({
    mutationFn: () => generateListingCopy(form.features),
    onSuccess: (data) => setAdCopy(data.text),
  });

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleDownload = async () => {
    if (!listingId) return;
    const blob = await exportListingPack(listingId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listing-${listingId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (adCopy) await navigator.clipboard.writeText(adCopy);
  };

  return (
    <div className="p-4 space-y-4 border rounded">
      {step === 0 && (
        <div className="space-y-2">
          <label className="block">
            Property
            <input
              className="border p-1 w-full"
              value={form.property}
              onChange={(e) => setForm({ ...form, property: e.target.value })}
            />
          </label>
        </div>
      )}

      {step === 1 && (
        <PhotoUpload onUpload={(files) => setForm({ ...form, photos: files })} />
      )}

      {step === 2 && (
        <div className="space-y-2">
          <label className="block">
            Features
            <input
              className="border p-1 w-full"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <label className="block">
            Rent
            <input
              type="number"
              className="border p-1 w-full"
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
            />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          <label className="block">
            Description
            <textarea
              className="border p-1 w-full"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-2">
          <p>
            <strong>Property:</strong> {form.property}
          </p>
          <p>
            <strong>Features:</strong> {form.features}
          </p>
          <p>
            <strong>Rent:</strong> {form.rent}
          </p>
          <p>
            <strong>Description:</strong> {form.description}
          </p>
          <button
            type="button"
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={() => copyMutation.mutate()}
          >
            Generate Ad Copy
          </button>
          {adCopy && (
            <textarea
              className="border p-1 w-full mt-2"
              value={adCopy}
              onChange={(e) => setAdCopy(e.target.value)}
            />
          )}
        </div>
      )}

      <div className="flex justify-between">
        {step > 0 && (
          <button className="px-2 py-1 bg-gray-100" onClick={back}>
            Back
          </button>
        )}

        {step < 5 && (
          <button
            className="ml-auto px-2 py-1 bg-blue-500 text-white"
            onClick={next}
          >
            Next
          </button>
        )}

        {step === 5 && (
          <button
            className="ml-auto px-2 py-1 bg-green-500 text-white"
            onClick={() => createMutation.mutate()}
          >
            Submit
          </button>
        )}
      </div>

      {createMutation.isSuccess && (
        <div className="space-x-2">
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={handleCopy}
          >
            Copy Ad Copy
          </button>
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={handleDownload}
          >
            Download Pack
          </button>
        </div>
      )}
      {createMutation.error && (
        <p className="text-red-600">{(createMutation.error as Error).message}</p>
      )}
    </div>
  );
}
