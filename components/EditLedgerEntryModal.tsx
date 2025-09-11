"use client";

import { useEffect, useState } from "react";
import type { LedgerEntry } from "../types/property";

interface Props {
  entry: LedgerEntry;
  onSave: (entry: LedgerEntry) => void;
  onClose: () => void;
}

export default function EditLedgerEntryModal({ entry, onSave, onClose }: Props) {
  const [datePaid, setDatePaid] = useState(entry.date);
  const [amount, setAmount] = useState(entry.amount.toString());

  useEffect(() => {
    setDatePaid(entry.date);
    setAmount(entry.amount.toString());
  }, [entry]);

  const daysLate = Math.max(
    0,
    Math.floor(
      (new Date(datePaid).getTime() - new Date(entry.date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const handleSave = () => {
    onSave({ ...entry, date: datePaid, amount: parseFloat(amount) || 0 });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="w-80 rounded-lg bg-white p-4 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">Ledger Entry</h2>
        <div className="mb-2">
          <label className="mb-1 block text-sm">Date Paid</label>
          <input
            type="date"
            className="w-full rounded border p-2 dark:bg-gray-700 dark:border-gray-600"
            value={datePaid}
            onChange={(e) => setDatePaid(e.target.value)}
          />
          {daysLate > 0 && (
            <p className="mt-1 text-sm text-red-500">Late by {daysLate} day(s)</p>
          )}
        </div>
        <div className="mb-2">
          <label className="mb-1 block text-sm">Amount</label>
          <input
            type="number"
            className="w-full rounded border p-2 dark:bg-gray-700 dark:border-gray-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-2 text-sm">
          <p>Description: {entry.description}</p>
          <p>Balance: {entry.balance}</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded bg-gray-200 px-4 py-2 dark:bg-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

