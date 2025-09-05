"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listIncome, deleteIncome } from "../lib/api";
import type { IncomeRow } from "../types/income";

export default function IncomesTable({
  propertyId,
}: {
  propertyId: string;
}) {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<IncomeRow[]>({
    queryKey: ["income", propertyId],
    queryFn: () => listIncome(propertyId),
  });
  const deleteMutation = useMutation<
    unknown,
    unknown,
    string,
    { previousIncome?: IncomeRow[] }
  >({
    mutationFn: (id: string) => deleteIncome(propertyId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["income", propertyId] });
      const previousIncome = queryClient.getQueryData<IncomeRow[]>([
        "income",
        propertyId,
      ]);
      queryClient.setQueryData<IncomeRow[]>([
        "income",
        propertyId,
      ], (old = []) => old.filter((i) => i.id !== id));
      return { previousIncome };
    },
    onError: (_err, _id, context) => {
      if (context?.previousIncome) {
        queryClient.setQueryData(["income", propertyId], context.previousIncome);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["income", propertyId] });
    },
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [source, setSource] = useState("");

  const rows = data.filter((r) => {
    const afterFrom = from ? new Date(r.date) >= new Date(from) : true;
    const beforeTo = to ? new Date(r.date) <= new Date(to) : true;
    const sourceMatch = source
      ? r.source.toLowerCase().includes(source.toLowerCase())
      : true;
    return afterFrom && beforeTo && sourceMatch;
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          className="border p-1"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          className="border p-1"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />
        <input
          className="border p-1"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Source</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Notes</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.source}</td>
              <td className="p-2">{r.amount}</td>
              <td className="p-2">{r.notes}</td>
              <td className="p-2">
                <button
                  className="text-red-600 underline"
                  onClick={() => {
                    if (confirm("Delete this income?")) {
                      deleteMutation.mutate(r.id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
