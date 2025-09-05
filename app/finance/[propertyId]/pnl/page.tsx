"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import PnLChart from "../../../../components/PnLChart";
import IncomeForm from "../../../../components/IncomeForm";
import IncomesTable from "../../../../components/IncomesTable";
import { getPnLSummary, type PnLSummary } from "../../../../lib/api";
import { exportCSV, exportPDF } from "../../../../lib/export";
import { logEvent } from "../../../../lib/log";

export default function PnLPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data } = useQuery<PnLSummary>({
    queryKey: ["pnl", propertyId],
    queryFn: () => getPnLSummary(propertyId),
  });

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Month", "Net"],
      ...data.monthly.map((m) => [m.month, m.net.toString()]),
    ];
    exportCSV("pnl.csv", rows);
    logEvent("export_csv", { propertyId });
  };

  const handleExportPDF = () => {
    if (!data) return;
    const rows = data.monthly
      .map((m) => `<tr><td>${m.month}</td><td>${m.net}</td></tr>`)
      .join("");
    const html = `<table border='1'><tr><th>Month</th><th>Net</th></tr>${rows}</table>`;
    exportPDF("pnl.pdf", html);
    logEvent("export_pdf", { propertyId });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">P&L</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Total Income</div>
          <div className="text-xl font-semibold">
            {data?.totalIncome ?? 0}
          </div>
        </div>
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Total Expenses</div>
          <div className="text-xl font-semibold">
            {data?.totalExpenses ?? 0}
          </div>
        </div>
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Net</div>
          <div className="text-xl font-semibold">{data?.net ?? 0}</div>
        </div>
      </div>
      <PnLChart data={data?.monthly ?? []} />
      <div className="flex gap-2">
        <button
          className="px-2 py-1 bg-gray-200"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
        <button
          className="px-2 py-1 bg-gray-200"
          onClick={handleExportPDF}
        >
          Export PDF
        </button>
      </div>
      <IncomeForm />
      <IncomesTable />
    </div>
  );
}
