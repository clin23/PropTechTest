"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PhotoUpload from "./PhotoUpload";
import { createListing } from "../lib/api";

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

  const mutation = useMutation(() =>
    createListing({
      property: form.property,
      photos: form.photos.map((f) => f.name),
      features: form.features,
      rent: parseFloat(form.rent),
      description: form.description,
    })
  );

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 0));

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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <button
            type="button"
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={() =>
              setForm({
                ...form,
                description: `Beautiful property with ${form.features}`,
              })
            }
          >
            Generate Copy
          </button>
        </div>
      )}

      <div className="flex justify-between">
      {step > 0 && (
        <button className="px-2 py-1 bg-gray-100" onClick={back}>
          Back
        </button>
      )}

      {step < 4 && (
        <button className="ml-auto px-2 py-1 bg-blue-500 text-white" onClick={next}>
          Next
        </button>
      )}

      {step === 4 && (
        <button
          className="ml-auto px-2 py-1 bg-green-500 text-white"
          onClick={() => mutation.mutate()}
        >
          Submit
        </button>
      )}
      </div>

      {mutation.isSuccess && (
        <p className="text-green-600">Listing created</p>
      )}
      {mutation.error && (
        <p className="text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  );
}
