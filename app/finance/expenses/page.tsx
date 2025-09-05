"use client";

import { useQuery } from "@tanstack/react-query";
import ExpenseForm from "../../../components/ExpenseForm";
import ExpensesTable from "../../../components/ExpensesTable";
import { getPnLSummary, type PnLSummary } from "../../../lib/api";

const propertyId = "test-property";

export default function ExpensesPage() {
  const { data } = useQuery<PnLSummary>({
    queryKey: ["pnl", propertyId],
    queryFn: () => getPnLSummary(propertyId),
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Expenses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Income</div>
          <div className="text-xl font-semibold">{data?.totalIncome ?? 0}</div>
        </div>
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-xl font-semibold">{data?.totalExpenses ?? 0}</div>
        </div>
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Net</div>
          <div className="text-xl font-semibold">{data?.net ?? 0}</div>
        </div>
      </div>
      <ExpenseForm propertyId={propertyId} />
      <div className="mt-4">
        <ExpensesTable propertyId={propertyId} />
      </div>
    </div>
  );
}

