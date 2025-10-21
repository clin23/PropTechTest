"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { listLedger, updateLedgerEntry } from "../lib/api";
import { formatShortDate } from "../lib/format";
import type { LedgerEntry, LedgerStatus } from "../types/property";
import EditLedgerEntryModal from "./EditLedgerEntryModal";
import EvidenceLink from "./EvidenceLink";
import { useScrollLockOnHover } from "../hooks/useScrollLockOnHover";

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
  const scrollRef = useScrollLockOnHover<HTMLDivElement>();

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
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="card mx-4 overflow-visible rounded-xl">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
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
                    <td className="p-2">{formatShortDate(e.date)}</td>
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
          </div>
        </div>
      </div>
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
  const config: Record<
    LedgerStatus,
    { label: string; bg: string; text: string }
  > = {
    paid: {
      label: "Paid",
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-200",
    },
    unpaid: {
      label: "Unpaid",
      bg: "bg-rose-100 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-200",
    },
    follow_up: {
      label: "Follow up",
      bg: "bg-amber-100 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-200",
    },
  };
  const { label, bg, text } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

