'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import DateRangePicker from './components/DateRangePicker';
import PropertyMultiSelect from './components/PropertyMultiSelect';
import KpiCard from './components/KpiCard';
import ExportButtons, { type CsvSection } from './components/ExportButtons';
import UpcomingList from './components/UpcomingList';
import {
  buildSearchParams,
  defaultState,
  formatDate,
  isSameState,
  parseStateFromSearch,
  type OverviewState,
} from './lib/urlState';
import {
  useCashflowSeries,
  useExpenseBreakdown,
  useOverviewKpis,
  useProperties,
  usePropertySeries,
  useUpcoming,
} from './hooks/useAnalytics';

const CashflowChart = dynamic(() => import('./components/ChartCashflow'), {
  ssr: false,
  loading: () => <ChartPlaceholder title="Cashflow Over Time" />,
});

const ExpenseDonut = dynamic(() => import('./components/ChartExpenseDonut'), {
  ssr: false,
  loading: () => <ChartPlaceholder title="Expense Breakdown" />,
});

const PropertyCompare = dynamic(() => import('./components/ChartPropertyCompare'), {
  ssr: false,
  loading: () => <ChartPlaceholder title="Property Comparison" />,
});

type ChartRange = { from: string; to: string };

type ChartPlaceholderProps = { title: string };

function ChartPlaceholder({ title }: ChartPlaceholderProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm h-72 flex flex-col">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</div>
    </div>
  );
}

function toMonthRange(label: string): ChartRange | null {
  if (!/\d{4}-\d{2}/.test(label)) return null;
  const [year, month] = label.split('-').map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(year) || Number.isNaN(month)) return null;
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  return { from: formatDate(from), to: formatDate(to) };
}

function buildCsvSections(params: {
  cashflow?: { buckets: { label: string; income: number; expenses: number; net: number }[] };
  breakdown?: { items: { category: string; value: number }[] };
  properties?: { items: { propertyLabel: string; net: number }[] };
}): CsvSection[] {
  const sections: CsvSection[] = [];
  if (params.cashflow && params.cashflow.buckets.length) {
    sections.push({
      label: 'Cashflow Series',
      headers: ['Period', 'Income', 'Expenses', 'Net'],
      rows: params.cashflow.buckets.map((bucket) => [
        bucket.label,
        bucket.income,
        bucket.expenses,
        bucket.net,
      ]),
    });
  }
  if (params.breakdown && params.breakdown.items.length) {
    sections.push({
      label: 'Expense Breakdown',
      headers: ['Category', 'Value'],
      rows: params.breakdown.items.map((item) => [item.category, item.value]),
    });
  }
  if (params.properties && params.properties.items.length) {
    sections.push({
      label: 'Property Comparison',
      headers: ['Property', 'Net Cashflow'],
      rows: params.properties.items.map((item) => [item.propertyLabel, item.net]),
    });
  }
  return sections;
}

function AnalyticsOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = useMemo(() => searchParams.toString(), [searchParams]);
  const initialFromUrl = useMemo(() => parseStateFromSearch(new URLSearchParams(searchKey)), [searchKey]);
  const [filters, setFilters] = useState<OverviewState>(initialFromUrl ?? defaultState());
  const [debouncedFilters, setDebouncedFilters] = useState<OverviewState>(filters);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters(filters), 300);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    if (!isSameState(initialFromUrl, filters)) {
      setFilters(initialFromUrl);
      setDebouncedFilters(initialFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFromUrl.from, initialFromUrl.to, initialFromUrl.expenseCategory, initialFromUrl.propertyIds.join(',')]);

  useEffect(() => {
    const params = buildSearchParams(debouncedFilters).toString();
    if (params === searchKey) return;
    router.replace(`?${params}`, { scroll: false });
  }, [debouncedFilters, router, searchKey]);

  const propertiesQuery = useProperties();
  const propertyOptions = propertiesQuery.data ?? [];
  const baseParams = {
    from: debouncedFilters.from,
    to: debouncedFilters.to,
    propertyIds: debouncedFilters.propertyIds,
  };

  const kpiQuery = useOverviewKpis(baseParams);
  const cashflowQuery = useCashflowSeries(baseParams);
  const breakdownQuery = useExpenseBreakdown(baseParams);
  const propertySeriesQuery = usePropertySeries(baseParams);
  const upcomingQuery = useUpcoming(baseParams);

  const hasData =
    (cashflowQuery.data?.buckets.length ?? 0) > 0 ||
    (breakdownQuery.data?.items.length ?? 0) > 0 ||
    (propertySeriesQuery.data?.items.length ?? 0) > 0;

  const cashflowRef = useRef<HTMLDivElement>(null);
  const expenseRef = useRef<HTMLDivElement>(null);
  const propertyRef = useRef<HTMLDivElement>(null);

  const csvSections = useMemo(
    () =>
      buildCsvSections({
        cashflow: cashflowQuery.data,
        breakdown: breakdownQuery.data,
        properties: propertySeriesQuery.data,
      }),
    [breakdownQuery.data, cashflowQuery.data, propertySeriesQuery.data],
  );

  const hiddenPropertyCount = useMemo(() => {
    if (!propertyOptions.length || debouncedFilters.propertyIds.length === 0) return 0;
    const activeIds = new Set(propertyOptions.map((property) => property.id));
    return Array.from(activeIds).filter((id) => !debouncedFilters.propertyIds.includes(id)).length;
  }, [propertyOptions, debouncedFilters.propertyIds]);

  const charts = [
    { id: 'cashflow', label: 'Cashflow Over Time', element: cashflowRef.current },
    { id: 'expenses', label: 'Expense Breakdown', element: expenseRef.current },
    { id: 'property', label: 'Property Comparison', element: propertyRef.current },
  ];

  const isLoading =
    kpiQuery.isLoading ||
    cashflowQuery.isLoading ||
    breakdownQuery.isLoading ||
    propertySeriesQuery.isLoading ||
    upcomingQuery.isLoading;

  return (
    <div className="px-4 py-6 sm:px-6 md:px-8">
      <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Analytics
      </Link>
      <div className="mx-auto mt-4 max-w-[1200px] space-y-6">
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          <DateRangePicker
            value={{ from: filters.from, to: filters.to }}
            onChange={(range) => setFilters((prev) => ({ ...prev, ...range }))}
          />
          <PropertyMultiSelect
            properties={propertyOptions}
            selected={filters.propertyIds}
            onChange={(next) => setFilters((prev) => ({ ...prev, propertyIds: next }))}
          />
          <ExportButtons csvSections={csvSections} charts={charts} />
        </div>

        {filters.expenseCategory && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-300">Active filters:</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
              onClick={() => setFilters((prev) => ({ ...prev, expenseCategory: undefined }))}
            >
              {filters.expenseCategory}
              <span aria-hidden>&times;</span>
            </button>
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Net Cashflow" value={kpiQuery.data?.netCashflow} format="currency" precision={0} />
          <KpiCard
            title="Gross Yield"
            value={kpiQuery.data?.grossYield ?? undefined}
            format="percentage"
            precision={1}
            tooltip={kpiQuery.data?.grossYield ? undefined : 'Add property values to see gross yield'}
          />
          <KpiCard
            title="Occupancy Rate"
            value={kpiQuery.data?.occupancyRate ?? undefined}
            format="percentage"
            precision={1}
          />
          <KpiCard
            title="On-Time Collection"
            value={kpiQuery.data?.onTimeCollection ?? undefined}
            format="percentage"
            precision={1}
          />
        </div>

        {!isLoading && !hasData ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <p className="font-medium">No data for this range.</p>
            <p className="mt-2">Try adjusting your dates or clearing filters to see more activity.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-blue-500 hover:text-blue-600"
                onClick={() => setFilters(defaultState())}
              >
                FYTD
              </button>
              <button
                type="button"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-blue-500 hover:text-blue-600"
                onClick={() => setFilters((prev) => ({ ...prev, propertyIds: [] }))}
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CashflowChart
                  ref={cashflowRef}
                  data={cashflowQuery.data?.buckets ?? []}
                  onBrushChange={(range) => {
                    const monthRange = toMonthRange(range.from);
                    const monthRangeEnd = toMonthRange(range.to);
                    if (monthRange && monthRangeEnd) {
                      setFilters((prev) => ({
                        ...prev,
                        from: monthRange.from,
                        to: monthRangeEnd.to,
                      }));
                    }
                  }}
                />
              </div>
              <div>
                <ExpenseDonut
                  ref={expenseRef}
                  data={breakdownQuery.data?.items ?? []}
                  total={breakdownQuery.data?.total ?? 0}
                  selectedCategory={filters.expenseCategory}
                  onSelectCategory={(category) =>
                    setFilters((prev) => ({ ...prev, expenseCategory: category ?? undefined }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Rent vs Market</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Connect market data to benchmark your rents against the local median.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:border-blue-500 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                >
                  Connect data
                </button>
              </div>
              <div className="lg:col-span-2">
                <UpcomingList items={upcomingQuery.data?.items ?? []} />
              </div>
              <div className="lg:col-span-1">
                <PropertyCompare
                  ref={propertyRef}
                  data={propertySeriesQuery.data?.items ?? []}
                  hiddenCount={hiddenPropertyCount}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsOverviewPage;
