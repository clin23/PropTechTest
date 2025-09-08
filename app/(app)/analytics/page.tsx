"use client";
import { useEffect, useState } from "react";
import PnLChart from "../../../components/PnLChart";
import Skeleton from "../../../components/Skeleton";
import {
  zPnlSeries,
  zRentMetrics,
  zExpenseBreakdown,
  zOccupancy,
} from "../../../lib/validation";
import type {
  PnLSeries,
  RentMetrics,
  ExpenseBreakdown,
  Occupancy,
} from "../../../types/analytics";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function AnalyticsPage() {
  const [pnl, setPnl] = useState<PnLSeries | null>(null);
  const [rent, setRent] = useState<RentMetrics | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseBreakdown | null>(null);
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);

  useEffect(() => {
    fetch("/api/analytics/pnl")
      .then((res) => res.json())
      .then((json) => setPnl(zPnlSeries.parse(json)))
      .catch(() => {});
    fetch("/api/analytics/rent")
      .then((res) => res.json())
      .then((json) => setRent(zRentMetrics.parse(json)))
      .catch(() => {});
    fetch("/api/analytics/expenses")
      .then((res) => res.json())
      .then((json) => setExpenseData(zExpenseBreakdown.parse(json)))
      .catch(() => {});
    fetch("/api/analytics/occupancy")
      .then((res) => res.json())
      .then((json) => setOccupancy(zOccupancy.parse(json)))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-4" data-testid="kpis">
        <div className="p-4 border rounded" data-testid="kpi-net">
          <div className="text-sm text-gray-500">Net</div>
          <div className="text-xl font-bold">{pnl ? pnl.totals.net : '-'}</div>
        </div>
        <div className="p-4 border rounded" data-testid="kpi-collection">
          <div className="text-sm text-gray-500">Collection rate</div>
          <div className="text-xl font-bold">
            {rent ? `${Math.round(rent.collectionRate * 100)}%` : '-'}
          </div>
        </div>
        <div className="p-4 border rounded" data-testid="kpi-arrears">
          <div className="text-sm text-gray-500">Arrears amount</div>
          <div className="text-xl font-bold">{rent ? rent.arrearsAmount : '-'}</div>
        </div>
        <div className="p-4 border rounded" data-testid="kpi-occupancy">
          <div className="text-sm text-gray-500">Occupancy rate</div>
          <div className="text-xl font-bold">
            {occupancy ? `${Math.round(occupancy.occupancyRate * 100)}%` : '-'}
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-semibold mb-2">P&L Trend</h2>
        {pnl ? <PnLChart data={pnl.series} /> : <Skeleton className="h-64" />}
        <a className="text-sm text-blue-600" href="/api/analytics/export/pnl.csv">
          Export CSV
        </a>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Expense Breakdown</h2>
        {expenseData ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="amount"
                    nameKey="category"
                    data={expenseData.slices}
                    label
                  >
                    {expenseData.slices.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2">
              {expenseData.slices.map((s) => (
                <li key={s.category} data-testid="expense-category">
                  {s.category}: {s.amount}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Skeleton className="h-64" />
        )}
        <a className="text-sm text-blue-600" href="/api/analytics/export/expenses.csv">
          Export CSV
        </a>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Rent Collection</h2>
        {rent ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Rent', expected: rent.expected, received: rent.received }]}> 
                <XAxis dataKey="name" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip />
                <Bar dataKey="expected" fill="#8884d8" />
                <Bar dataKey="received" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Skeleton className="h-64" />
        )}
        <a className="text-sm text-blue-600" href="/api/analytics/export/rent.csv">
          Export CSV
        </a>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Occupancy</h2>
        {occupancy ? (
          <div className="text-xl font-bold">{Math.round(occupancy.occupancyRate * 100)}%</div>
        ) : (
          <Skeleton className="h-8" />
        )}
      </section>
    </div>
  );
}
