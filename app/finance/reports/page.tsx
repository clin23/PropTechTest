"use client";

import { useQuery } from "@tanstack/react-query";
import PnLChart from "../../../components/PnLChart";
import IncomeForm from "../../../components/IncomeForm";
import IncomesTable from "../../../components/IncomesTable";
import { getPnLSummary, listExpenses, type PnLSummary } from "../../../lib/api";
import { exportExpensesCSV, exportExpensesPDF } from "../../../lib/export";
import type { ExpenseRow } from "../../../types/expense";
import { logEvent } from "../../../lib/log";

const propertyId = "test-property";

export default function ReportsPage() {
  const { data } = useQuery<PnLSummary>({
    queryKey: ["pnl", propertyId],
    queryFn: () => getPnLSummary(propertyId),
  });

  const { data: expenses = [] } = useQuery<ExpenseRow[]>({
    queryKey: ["expenses", propertyId],
    queryFn: () => listExpenses(propertyId),
  });

  const handleExportCSV = () => {
    exportExpensesCSV("expenses.csv", expenses);
    logEvent("export_csv", { propertyId });
  };

  const handleExportPDF = () => {
    exportExpensesPDF("expenses.pdf", expenses);
    logEvent("export_pdf", { propertyId });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
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
      <PnLChart data={data?.monthly ?? []} />
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-gray-200" onClick={handleExportCSV}>
          Export CSV
        </button>
        <button className="px-2 py-1 bg-gray-200" onClick={handleExportPDF}>
          Export PDF
        </button>
      </div>
      <IncomeForm propertyId={propertyId} />
      <IncomesTable propertyId={propertyId} />
    </div>
  );
}

