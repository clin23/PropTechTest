"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import PnLChart from "../../../../components/PnLChart";
import { getPnLSummary, type PnLSummary } from "../../../../lib/api";

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
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pnl.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!data) return;
    const win = window.open("", "_blank");
    if (win) {
      const rows = data.monthly
        .map((m) => `<tr><td>${m.month}</td><td>${m.net}</td></tr>`) // simple table
        .join("");
      win.document.write(
        `<table border='1'><tr><th>Month</th><th>Net</th></tr>${rows}</table>`
      );
      win.document.close();
      win.print();
      win.close();
    }
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
    </div>
  );
}
