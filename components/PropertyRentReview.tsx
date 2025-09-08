"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listLeases, computeRentIncrease, generateNotice, Lease } from "../lib/api";
import Skeleton from "./Skeleton";
import ErrorState from "./ErrorState";

interface Props {
  propertyId: string;
}

export default function PropertyRentReview({ propertyId }: Props) {
  const { data: leases = [], isLoading, error } = useQuery<Lease[]>({
    queryKey: ["leases"],
    queryFn: listLeases,
  });
  const lease = leases.find((l) => l.propertyId === propertyId);

  const [open, setOpen] = useState(false);
  const [currentRent, setCurrentRent] = useState("");
  const [cpi, setCpi] = useState("");
  const [percent, setPercent] = useState("");
  const [amount, setAmount] = useState("");
  const [newRent, setNewRent] = useState<number | null>(null);

  const compute = useMutation({
    mutationFn: () =>
      computeRentIncrease({
        currentRent: parseFloat(currentRent),
        cpiPercent: parseFloat(cpi),
        targetPercent: parseFloat(percent),
        targetAmount: parseFloat(amount),
      }),
    onSuccess: (data) => setNewRent(data.newRent),
  });

  const generate = useMutation({
    mutationFn: () =>
      generateNotice({
        tenancyId: lease?.id,
        currentRent: parseFloat(currentRent),
        newRent,
      }),
    onSuccess: () => setOpen(false),
  });

  if (isLoading) return <Skeleton className="h-24" />;
  if (error) return <ErrorState message={(error as Error).message} />;
  if (!lease) return <p>No lease found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Rent Review</h2>
      <p>Current Rent: {lease.currentRent}</p>
      <p>Next Review: {lease.nextReview}</p>
      <button
        className="mt-2 px-2 py-1 bg-blue-500 text-white"
        onClick={() => {
          setOpen(true);
          setCurrentRent(String(lease.currentRent));
          setCpi("");
          setPercent("");
          setAmount("");
          setNewRent(null);
        }}
      >
        Review
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex justify-end">
          <div className="bg-white w-96 p-4 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Rent Review</h3>
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
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
            </label>
            <label className="block">
              or Target Amount
              <input
                type="number"
                className="border p-1 w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <div>New rent: {newRent !== null ? newRent.toFixed(2) : '-'}</div>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-gray-200"
                onClick={() => compute.mutate()}
              >
                Calculate
              </button>
              <button
                className="px-2 py-1 bg-blue-500 text-white"
                disabled={newRent === null}
                onClick={() => generate.mutate()}
              >
                Generate Notice
              </button>
              <button className="px-2 py-1" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            {generate.isSuccess && (
              <p className="text-green-600">Notice generated</p>
            )}
            {generate.error && (
              <ErrorState message={(generate.error as Error).message} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

