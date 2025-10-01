'use client';

import { useEffect, useMemo, useState } from 'react';
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
import type { DashboardDTO, PortfolioSummary, PropertyCardData } from '../../types/dashboard';

// Use the first day of the current month to show month-to-date data.
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const formatISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
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
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [propertyOrder, setPropertyOrder] = useState<string[]>(() =>
    data.properties.map((property) => property.propertyId),
  );

  useEffect(() => {
    setPropertyOrder((previous) => ensurePropertyOrder(previous, data.properties));
  }, [data.properties]);

  const propertyLookup = useMemo(() => {
    const lookup = new Map<string, PropertyCardData>();
    data.properties.forEach((property) => {
      lookup.set(property.propertyId, property);
    });
    return lookup;
  }, [data.properties]);

  const orderedProperties = useMemo(() => {
    const completeOrder = ensurePropertyOrder(propertyOrder, data.properties);
    const resolved = completeOrder
      .map((propertyId) => propertyLookup.get(propertyId))
      .filter(Boolean) as PropertyCardData[];

    if (resolved.length === data.properties.length) {
      return resolved;
    }

    const missing = data.properties.filter(
      (property) => !resolved.some((item) => item.propertyId === property.propertyId),
    );

    return [...resolved, ...missing];
  }, [data.properties, propertyLookup, propertyOrder]);

  const handleMove = (propertyId: string, direction: 'up' | 'down') => {
    setPropertyOrder((current) => {
      const completeOrder = ensurePropertyOrder(current, data.properties);
      const index = completeOrder.indexOf(propertyId);

      if (index === -1) {
        return completeOrder;
      }

      const targetIndex =
        direction === 'up'
          ? Math.max(0, index - 1)
          : Math.min(completeOrder.length - 1, index + 1);

      if (targetIndex === index) {
        return completeOrder;
      }

      const updated = [...completeOrder];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);

      return updated;
    });
  };

  const showReorderTile = data.properties.length > 3;

  return (
    <div className="space-y-6">
      <div>
        <Header from={from} to={to} />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-8 lg:sticky lg:top-6 lg:self-start">
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
          {showReorderTile && (
            <div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(true)}
                className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Property order</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Adjust display sequence
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Manage
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Rearrange how your properties appear on this dashboard.
                </p>
              </button>
            </div>
          )}
          {orderedProperties.map((property) => (
            <div key={property.propertyId}>
              <PropertyCard data={property} />
            </div>
          ))}
        </section>
      </div>
      {isOrderModalOpen && (
        <PropertyReorderModal
          properties={orderedProperties}
          onClose={() => setOrderModalOpen(false)}
          onMove={handleMove}
        />
      )}
    </div>
  );
}

function ensurePropertyOrder(order: string[], properties: PropertyCardData[]) {
  const propertyIds = properties.map((property) => property.propertyId);
  const uniqueOrder = order.filter(
    (propertyId, index) => order.indexOf(propertyId) === index && propertyIds.includes(propertyId),
  );
  const missing = propertyIds.filter((propertyId) => !uniqueOrder.includes(propertyId));

  return [...uniqueOrder, ...missing];
}

function PropertyReorderModal({
  properties,
  onClose,
  onMove,
}: {
  properties: PropertyCardData[];
  onClose: () => void;
  onMove: (propertyId: string, direction: 'up' | 'down') => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reorder properties</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Drag handles are replaced with quick controls—use the arrows to move a property up or down.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Done
          </button>
        </div>
        <ul className="space-y-3">
          {properties.map((property, index) => (
            <li
              key={property.propertyId}
              className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{property.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Position {index + 1}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onMove(property.propertyId, 'up')}
                  className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  disabled={index === 0}
                  aria-label={`Move ${property.name} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMove(property.propertyId, 'down')}
                  className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  disabled={index === properties.length - 1}
                  aria-label={`Move ${property.name} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          Changes are saved automatically. Click outside this card to close it.
        </p>
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
