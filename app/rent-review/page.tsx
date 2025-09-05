"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listLeases, computeRentIncrease, generateNotice, Lease } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import Skeleton from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

export default function RentReviewPage() {
  const {
    data: leases = [],
    isLoading,
    error,
  } = useQuery({ queryKey: ['leases'], queryFn: listLeases });
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Lease | null>(null);
  const [currentRent, setCurrentRent] = useState('');
  const [cpi, setCpi] = useState('');
  const [percent, setPercent] = useState('');
  const [amount, setAmount] = useState('');
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
        tenancyId: selected?.id,
        currentRent: parseFloat(currentRent),
        newRent,
      }),
    onSuccess: () => setSelected(null),
  });

  const filtered = leases.filter((l) =>
    l.address.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6">
      <PageHeader title="Rent Reviews" />
      <input
        placeholder="Filter by address"
        className="border p-1 mb-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <ErrorState message={(error as Error).message} />
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="text-left">
              <th className="p-2 border">Property</th>
              <th className="p-2 border">Current Rent</th>
              <th className="p-2 border">Next Review</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td className="p-2 border">{l.address}</td>
                <td className="p-2 border">{l.currentRent}</td>
                <td className="p-2 border">{l.nextReview}</td>
                <td className="p-2 border">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white"
                    onClick={() => {
                      setSelected(l);
                      setCurrentRent(String(l.currentRent));
                      setCpi('');
                      setPercent('');
                      setAmount('');
                      setNewRent(null);
                    }}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex justify-end">
          <div className="bg-white w-96 p-4 space-y-2">
            <h2 className="text-xl font-semibold mb-2">Rent Review</h2>
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
              <button className="px-2 py-1" onClick={() => setSelected(null)}>
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
