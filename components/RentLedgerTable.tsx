"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { listLedger, updateLedgerEntry } from "../lib/api";
import type { LedgerEntry } from "../types/property";
import EditLedgerEntryModal from "./EditLedgerEntryModal";

export default function RentLedgerTable({
  propertyId: propId,
}: {
  propertyId?: string;
}) {
  const params = useParams<{ propertyId?: string; id?: string }>();
  const propertyId = propId ?? params.propertyId ?? params.id ?? "";
  const { data = [] } = useQuery<LedgerEntry[]>({
    queryKey: ["ledger", propertyId],
    queryFn: () => listLedger(propertyId),
  });

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [selected, setSelected] = useState<LedgerEntry | null>(null);

  const calculateBalances = (items: LedgerEntry[]) => {
    let balance = 0;
    return items.map((e) => {
      balance += e.amount;
      return { ...e, balance };
    });
  };

  useEffect(() => {
    setEntries(calculateBalances(data));
  }, [data]);

  const handleSave = async (entry: LedgerEntry) => {
    await updateLedgerEntry(entry.id, {
      amount: entry.amount,
      date: entry.date,
    });
    const updated = entries
      .map((e) => (e.id === entry.id ? entry : e))
      .sort((a, b) => a.date.localeCompare(b.date));
    setEntries(calculateBalances(updated));
    setSelected(null);
  };

  return (
    <>
      <table className="min-w-full border rounded card">
        <thead>
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.id}
              className="cursor-pointer border-t border-[var(--border)] hover:bg-[var(--hover)]"
              onClick={() => setSelected(e)}
            >
              <td className="p-2">{e.date}</td>
              <td className="p-2">{e.description}</td>
              <td className="p-2">{e.amount}</td>
              <td className="p-2">{e.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <EditLedgerEntryModal
          entry={selected}
          onSave={handleSave}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

