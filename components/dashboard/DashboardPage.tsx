'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Skeleton from '../Skeleton';
import { SharedTile } from '../SharedTile';
import MetricCard from './MetricCard';
import CashflowLineChart from './CashflowLineChart';
import PieCard from './PieCard';
import PropertyCard from './PropertyCard';
import { getDashboard } from '../../lib/dashboard';
import { formatMoney } from '../../lib/format';
import Header from './Header';
import type { DashboardDTO, PortfolioSummary } from '../../types/dashboard';

// Use the first day of the current month to show month-to-date data.
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const formatISODate = (d: Date) => d.toISOString().split('T')[0];
const getAustralianFinancialYearBounds = (date: Date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 6 ? year : year - 1;
  return { startYear, endYear: startYear + 1 };
};

export default function DashboardPage() {
  const [from] = useState(() => startOfMonth(new Date()));
  const [to] = useState(() => new Date());
  const { startYear: fyStartYear, endYear: fyEndYear } = getAustralianFinancialYearBounds(to);
  const fyLabel = `FY${String(fyEndYear).slice(-2)}`;
  const fyHint = `Australian Financial Year (${fyStartYear}-${fyEndYear})`;

  const { data, isError } = useQuery({
    queryKey: ['dashboard', from, to],
    queryFn: () => getDashboard(formatISODate(from), formatISODate(to)),
  });

  if (isError) {
    return <div className="p-6">Failed to load dashboard</div>;
  }

  const ready = Boolean(data);

  return (
    <div className="relative">
      {!ready && (
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      )}
      {data && (
        <div className="p-6">
          <DashboardContent
            data={data}
            from={from}
            to={to}
            fyLabel={fyLabel}
            fyHint={fyHint}
          />
        </div>
      )}
    </div>
  );
}

function DashboardContent({
  data,
  from,
  to,
  fyLabel,
  fyHint,
}: {
  data: DashboardDTO;
  from: Date;
  to: Date;
  fyLabel: string;
  fyHint: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Header from={from} to={to} />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <PortfolioSummaryTile summary={data.portfolio} />
            </div>
            <div>
              <MetricCard
                title="YTD Cashflow"
                value={formatMoney(data.cashflow.ytdNet.amountCents)}
                hint="Year to Date"
              />
            </div>
            <div>
              <MetricCard
                title="MTD Cashflow"
                value={formatMoney(data.cashflow.mtdNet.amountCents)}
                hint="Month to Date"
              />
            </div>
            <div>
              <MetricCard
                title={`${fyLabel} Income`}
                value={formatMoney(data.cashflow.fyIncome.amountCents)}
                hint={fyHint}
              />
            </div>
            <div>
              <MetricCard
                title={`${fyLabel} Expenses`}
                value={formatMoney(data.cashflow.fyExpense.amountCents)}
                hint={fyHint}
              />
            </div>
          </section>
          <div>
            <CashflowLineChart data={data.lineSeries.points} />
          </div>
          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <PieCard
                title="Income by Property"
                data={data.incomeByProperty}
                labelKey="propertyName"
                valueKey="incomeCents"
              />
            </div>
            <div>
              <PieCard
                title="Expenses by Category"
                data={data.expensesByCategory}
                labelKey="category"
                valueKey="amountCents"
              />
            </div>
          </section>
        </div>
        <section className="space-y-4 lg:col-span-4">
          {data.properties.map((p) => (
            <div key={p.propertyId}>
              <PropertyCard data={p} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function PortfolioSummaryTile({ summary }: { summary: PortfolioSummary }) {
  const stats = [
    { label: 'Properties', value: summary.propertiesCount },
    { label: 'Occupied', value: summary.occupiedCount },
    { label: 'Vacant', value: summary.vacancyCount },
  ] as const;

  return (
    <SharedTile>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio snapshot</p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Properties overview</h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</dt>
              <dd className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SharedTile>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-5 w-28" />
              <div className="mt-4 grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-3 h-4 w-1/2" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
