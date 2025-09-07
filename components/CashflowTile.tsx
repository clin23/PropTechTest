"use client";
import { useEffect, useState } from "react";
import Skeleton from "./Skeleton";
import { useToast } from "./ui/use-toast";
import { z } from "zod";
import type { CashflowSummary } from "../types/summary";

const schema = z.object({
  monthIncome: z.number(),
  monthExpenses: z.number(),
  net: z.number(),
});

export default function CashflowTile() {
  const [data, setData] = useState<CashflowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/summary/cashflow")
      .then((res) => res.json())
      .then((json) => schema.parse(json))
      .then(setData)
      .catch(() => toast({ title: "Failed to load cashflow" }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="p-4 border rounded">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 border rounded" data-testid="cashflow-tile">
      <h2 className="text-lg font-bold mb-2">Monthly Cashflow</h2>
      <p>Income: ${data.monthIncome}</p>
      <p>Expenses: ${data.monthExpenses}</p>
      <p className="font-semibold">Net: ${data.net}</p>
    </div>
  );
}
