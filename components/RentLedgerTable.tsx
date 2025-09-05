"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listLedger } from "../lib/api";
import type { LedgerEntry } from "../types/property";

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

  return (
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Date</th>
          <th className="p-2 text-left">Description</th>
          <th className="p-2 text-left">Amount</th>
          <th className="p-2 text-left">Balance</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e) => (
          <tr key={e.id} className="border-t">
            <td className="p-2">{e.date}</td>
            <td className="p-2">{e.description}</td>
            <td className="p-2">{e.amount}</td>
            <td className="p-2">{e.balance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

