'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MetricCard from './MetricCard';
import CashflowLineChart from './CashflowLineChart';
import PieCard from './PieCard';
import PropertyCard from './PropertyCard';
import { getDashboard } from '../../lib/dashboard';
import { formatMoney } from '../../lib/format';
import Header from './Header';

// Use the first day of the previous month to show a two-month window ending today.
const startOfPreviousMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const formatISODate = (d: Date) => d.toISOString().split('T')[0];

export default function DashboardPage() {
  const [from] = useState(() => startOfPreviousMonth(new Date()));
  const [to] = useState(() => new Date());

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', from, to],
    queryFn: () => getDashboard(formatISODate(from), formatISODate(to)),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !data) return <div className="p-6">Failed to load dashboard</div>;

  return (
    <div className="p-6 space-y-6">
      <Header from={from} to={to} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard title="YTD Cashflow" value={formatMoney(data.cashflow.ytdNet.amountCents)} hint="Year to Date" />
            <MetricCard title="MTD Cashflow" value={formatMoney(data.cashflow.mtdNet.amountCents)} hint="Month to Date" />
          </div>
          <CashflowLineChart data={data.lineSeries.points} />
          <div className="grid gap-4 md:grid-cols-2">
            <PieCard title="Income by Property" data={data.incomeByProperty} labelKey="propertyName" valueKey="incomeCents" />
            <PieCard title="Expenses by Category" data={data.expensesByCategory} labelKey="category" valueKey="amountCents" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
          {data.properties.map((p) => (
            <PropertyCard key={p.propertyId} data={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
