'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

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

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 8, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

// Use the first day of the previous month to show a two-month window ending today.
const startOfPreviousMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const formatISODate = (d: Date) => d.toISOString().split('T')[0];
const getAustralianFinancialYearBounds = (date: Date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 6 ? year : year - 1;
  return { startYear, endYear: startYear + 1 };
};

export default function DashboardPage() {
  const [from] = useState(() => startOfPreviousMonth(new Date()));
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
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.12 }}
        className={`p-6 ${ready ? 'pointer-events-none absolute inset-0' : ''}`}
      >
        <DashboardSkeleton />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        className="p-6"
      >
        {data && (
          <DashboardContent
            data={data}
            from={from}
            to={to}
            fyLabel={fyLabel}
            fyHint={fyHint}
          />
        )}
      </motion.div>
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
  const reduceMotion = useReducedMotion();
  const containerMotion = reduceMotion
    ? {}
    : { variants: listVariants, initial: 'hidden' as const, animate: 'show' as const };
  const itemMotion = reduceMotion ? {} : { variants: itemVariants };
  const headerMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
      };

  return (
    <div className="space-y-6">
      <motion.div {...headerMotion}>
        <Header from={from} to={to} />
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div className="space-y-6 lg:col-span-8" {...containerMotion}>
          <motion.section className="grid gap-4 md:grid-cols-2" {...containerMotion}>
            <motion.div className="md:col-span-2" {...itemMotion}>
              <PortfolioSummaryTile summary={data.portfolio} />
            </motion.div>
            <motion.div {...itemMotion}>
              <MetricCard
                title="YTD Cashflow"
                value={formatMoney(data.cashflow.ytdNet.amountCents)}
                hint="Year to Date"
              />
            </motion.div>
            <motion.div {...itemMotion}>
              <MetricCard
                title="MTD Cashflow"
                value={formatMoney(data.cashflow.mtdNet.amountCents)}
                hint="Month to Date"
              />
            </motion.div>
            <motion.div {...itemMotion}>
              <MetricCard
                title={`${fyLabel} Income`}
                value={formatMoney(data.cashflow.fyIncome.amountCents)}
                hint={fyHint}
              />
            </motion.div>
            <motion.div {...itemMotion}>
              <MetricCard
                title={`${fyLabel} Expenses`}
                value={formatMoney(data.cashflow.fyExpense.amountCents)}
                hint={fyHint}
              />
            </motion.div>
          </motion.section>
          <motion.div {...itemMotion}>
            <CashflowLineChart data={data.lineSeries.points} />
          </motion.div>
          <motion.section className="grid gap-4 md:grid-cols-2" {...containerMotion}>
            <motion.div {...itemMotion}>
              <PieCard
                title="Income by Property"
                data={data.incomeByProperty}
                labelKey="propertyName"
                valueKey="incomeCents"
              />
            </motion.div>
            <motion.div {...itemMotion}>
              <PieCard
                title="Expenses by Category"
                data={data.expensesByCategory}
                labelKey="category"
                valueKey="amountCents"
              />
            </motion.div>
          </motion.section>
        </motion.div>
        <motion.section className="space-y-4 lg:col-span-4" {...containerMotion}>
          {data.properties.map((p) => (
            <motion.div key={p.propertyId} {...itemMotion}>
              <PropertyCard data={p} />
            </motion.div>
          ))}
        </motion.section>
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
