"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { listLedger, updateLedgerEntry } from "../lib/api";
import type { LedgerEntry, LedgerStatus } from "../types/property";
import EditLedgerEntryModal from "./EditLedgerEntryModal";
import EvidenceLink from "./EvidenceLink";

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
      balance += e.status === "paid" ? e.amount : 0;
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
      status: entry.status,
      evidenceUrl: entry.evidenceUrl ?? null,
      evidenceName: entry.evidenceName ?? null,
    });
    setEntries((prev) => {
      const updated = prev
        .map((e) => (e.id === entry.id ? { ...e, ...entry } : e))
        .sort((a, b) => a.date.localeCompare(b.date));
      return calculateBalances(updated);
    });
  };

  return (
    <>
      <table className="min-w-full border rounded card">
        <thead>
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-center">Evidence</th>
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
              <td className="p-2">
                <StatusDot status={e.status} />
              </td>
              <td className="p-2">{e.amount}</td>
              <td className="p-2 text-center">
                {e.evidenceUrl ? (
                  <EvidenceLink
                    href={e.evidenceUrl}
                    fileName={e.evidenceName}
                    className="mx-auto"
                  />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">&mdash;</span>
                )}
              </td>
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

function StatusDot({ status }: { status: LedgerStatus }) {
  const config: Record<LedgerStatus, { color: string; label: string }> = {
    paid: { color: "bg-green-500", label: "Paid" },
    unpaid: { color: "bg-red-500", label: "Unpaid" },
    follow_up: { color: "bg-orange-400", label: "Follow up" },
  };
  const { color, label } = config[status];
  return (
    <span className="inline-flex items-center">
      <span
        aria-label={label}
        title={label}
        className={`inline-flex h-3 w-3 rounded-full ${color}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

