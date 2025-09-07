"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PnLChart from "../../../../components/PnLChart";
import { useToast } from "../../../../components/ui/use-toast";
import { exportPDF } from "../../../../lib/export";
import { logEvent } from "../../../../lib/log";
import { getPnL, type PnL } from "../../../../lib/api";

const propertyId = "1";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function periodRange(period: string) {
  const now = new Date();
  switch (period) {
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = new Date(now.getFullYear(), q * 3 + 3, 0);
      return { from: formatDate(start), to: formatDate(end) };
    }
    case "fy": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { from: formatDate(start), to: formatDate(end) };
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: formatDate(start), to: formatDate(end) };
    }
  }
}

export default function PnLPage() {
  const [period, setPeriod] = useState("month");
  const initial = periodRange("month");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const { toast } = useToast();

  useEffect(() => {
    if (period === "custom") return;
    const range = periodRange(period);
    setFrom(range.from);
    setTo(range.to);
  }, [period]);

  const { data } = useQuery<PnL>({
    queryKey: ["pnl", propertyId, from, to],
    queryFn: () => getPnL({ propertyId, from, to }),
  });

  const params = () =>
    new URLSearchParams({ propertyId, from, to }).toString();

  const handleExportCSV = async () => {
    const res = await fetch(`/api/pnl/export.csv?${params()}`);
    const text = await res.text();
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pnl.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "P&L CSV downloaded" });
    logEvent("pnl_export_csv", { propertyId, from, to });
  };

  const handleExportPDF = async () => {
    const res = await fetch(`/api/pnl/export.pdf?${params()}`);
    const html = await res.text();
    exportPDF("pnl.pdf", html);
    toast({ title: "P&L PDF downloaded" });
    logEvent("pnl_export_pdf", { propertyId, from, to });
  };

  const handleExportExpensesCSV = async () => {
    const res = await fetch(`/api/expenses/export.csv?${params()}`);
    const text = await res.text();
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Expenses CSV downloaded" });
    logEvent("expenses_export_csv", { propertyId, from, to });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Profit &amp; Loss</h1>
      <div className="flex gap-2 items-center">
        <select
          className="border p-1"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="month">Month</option>
          <option value="quarter">Quarter</option>
          <option value="fy">FY</option>
          <option value="custom">Custom</option>
        </select>
        <input
          type="date"
          className="border p-1"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="border p-1"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Income</div>
          <div className="text-xl font-semibold">{data?.income ?? 0}</div>
        </div>
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-xl font-semibold">{data?.expenses ?? 0}</div>
        </div>
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Net</div>
          <div className="text-xl font-semibold">{data?.net ?? 0}</div>
        </div>
      </div>
      <PnLChart data={data?.series ?? []} />
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-gray-200" onClick={handleExportCSV}>
          Export P&amp;L CSV
        </button>
        <button className="px-2 py-1 bg-gray-200" onClick={handleExportPDF}>
          Export P&amp;L PDF
        </button>
        <button
          className="px-2 py-1 bg-gray-200"
          onClick={handleExportExpensesCSV}
        >
          Export Expenses CSV
        </button>
      </div>
    </div>
  );
}
