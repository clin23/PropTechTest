"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postRentReview } from "../lib/api";

export default function RentReviewCalc() {
  const [tenancyId, setTenancyId] = useState("");
  const [currentRent, setCurrentRent] = useState("0");
  const [cpi, setCpi] = useState("0");
  const [targetPercent, setTargetPercent] = useState("0");
  const [targetAmount, setTargetAmount] = useState("0");

  const newRent = targetPercent
    ? parseFloat(currentRent || "0") * (1 + parseFloat(targetPercent || "0") / 100)
    : parseFloat(currentRent || "0") + parseFloat(targetAmount || "0");

  const mutation = useMutation({
    mutationFn: () =>
      postRentReview(tenancyId, {
        currentRent: parseFloat(currentRent),
        cpiPercent: parseFloat(cpi),
        targetPercent: parseFloat(targetPercent),
        targetAmount: parseFloat(targetAmount),
        newRent,
      }),
  });

  return (
    <div className="p-4 space-y-2 border rounded">
      <label className="block">
        Tenancy ID
        <input
          className="border p-1 w-full"
          value={tenancyId}
          onChange={(e) => setTenancyId(e.target.value)}
        />
      </label>
      <label className="block">
        Current Rent
        <input
          type="number"
          className="border p-1 w-full"
          value={currentRent}
          onChange={(e) => setCurrentRent(e.target.value)}
        />
      </label>
      <label className="block">
        CPI %
        <input
          type="number"
          className="border p-1 w-full"
          value={cpi}
          onChange={(e) => setCpi(e.target.value)}
        />
      </label>
      <label className="block">
        Target Increase %
        <input
          type="number"
          className="border p-1 w-full"
          value={targetPercent}
          onChange={(e) => setTargetPercent(e.target.value)}
        />
      </label>
      <label className="block">
        or Target Amount
        <input
          type="number"
          className="border p-1 w-full"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />
      </label>
      <div>New rent: {isNaN(newRent) ? "-" : newRent.toFixed(2)}</div>
      <button
        className="px-2 py-1 bg-blue-500 text-white"
        onClick={() => mutation.mutate()}
        disabled={!tenancyId}
      >
        Generate Notice
      </button>
      {mutation.isSuccess && <p className="text-green-600">Notice generated</p>}
      {mutation.error && (
        <p className="text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  );
}
