'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import OverviewHeader from '../../../../components/analytics/OverviewHeader';
import KpiCards from '../../../../components/analytics/KpiCards';
import FiltersPanel from '../../../../components/analytics/FiltersPanel';
import ObligationsCard from '../../../../components/analytics/ObligationsCard';
import { AnalyticsFiltersProvider, useAnalyticsFilters } from '../../../../components/analytics/FiltersProvider';
import { type ChartRef, type CsvSection } from '../../../../components/analytics/ExportButtons';
import {
  useCashflowSeries,
  useExpenseBreakdown,
  useOverviewKpis,
  useProperties,
  usePropertySeries,
  useUpcoming,
} from './hooks/useAnalytics';
import { defaultState, formatDate, type OverviewState } from './lib/urlState';

const CashflowChart = dynamic(() => import('../../../../components/analytics/CashflowChart'), {
  ssr: false,
  loading: () => <ChartPlaceholder title="Cashflow Over Time" description="Trend loading" />,
});

const ExpenseBreakdown = dynamic(() => import('../../../../components/analytics/ExpenseBreakdown'), {
  ssr: false,
  loading: () => <ChartPlaceholder title="Expense Breakdown" description="Loading categories" />,
});

const PropertyComparison = dynamic(() => import('../../../../components/analytics/PropertyComparison'), {
  ssr: false,
  loading: () => <ChartPlaceholder title="Property Comparison" description="Gathering properties" />,
});

type ChartRange = { from: string; to: string };

type ChartPlaceholderProps = { title: string; description: string };

type RentMarketCardProps = {
  onConnect?: () => void;
};

function ChartPlaceholder({ title, description }: ChartPlaceholderProps) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300/60 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#161B22]">
      <div className="flex h-[320px] flex-col items-center justify-center text-center">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{description}</p>
      </div>
    </section>
  );
}

function RentMarketCard({ onConnect }: RentMarketCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:border-[#2F81F7]/50 dark:border-[#1F2937] dark:bg-[#161B22]">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Rent vs Market</h2>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Connect market data to benchmark your rents against the local median.
      </p>
      <button
        type="button"
        onClick={onConnect}
        className="mt-5 inline-flex items-center justify-center rounded-full border border-[#2F81F7] bg-[#2F81F7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6cd8]"
      >
        Connect data source
      </button>
    </section>
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
      rows: params.cashflow.buckets.map((bucket) => [bucket.label, bucket.income, bucket.expenses, bucket.net]),
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

function AnalyticsOverviewContent() {
  const { filters, activeFilters, setFilters, chartView, setChartView } = useAnalyticsFilters();
  const propertyQuery = useProperties();
  const propertyOptions = propertyQuery.data ?? [];

  const baseParams = {
    from: activeFilters.from,
    to: activeFilters.to,
    propertyIds: activeFilters.propertyIds,
  } satisfies Pick<OverviewState, 'from' | 'to' | 'propertyIds'>;

  const kpiQuery = useOverviewKpis(baseParams);
  const cashflowQuery = useCashflowSeries(baseParams);
  const breakdownQuery = useExpenseBreakdown(baseParams);
  const propertySeriesQuery = usePropertySeries(baseParams);
  const upcomingQuery = useUpcoming(baseParams);

  const isLoading =
    kpiQuery.isLoading ||
    cashflowQuery.isLoading ||
    breakdownQuery.isLoading ||
    propertySeriesQuery.isLoading ||
    upcomingQuery.isLoading;

  const hasData =
    (cashflowQuery.data?.buckets.length ?? 0) > 0 ||
    (breakdownQuery.data?.items.length ?? 0) > 0 ||
    (propertySeriesQuery.data?.items.length ?? 0) > 0;

  const cashflowRef = useRef<HTMLDivElement>(null);
  const expenseRef = useRef<HTMLDivElement>(null);
  const propertyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target =
      chartView === 'cashflow'
        ? cashflowRef.current
        : chartView === 'expenses'
        ? expenseRef.current
        : propertyRef.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [chartView]);

  const csvSections = useMemo(
    () =>
      buildCsvSections({
        cashflow: cashflowQuery.data,
        breakdown: breakdownQuery.data,
        properties: propertySeriesQuery.data,
      }),
    [breakdownQuery.data, cashflowQuery.data, propertySeriesQuery.data],
  );

  const charts: ChartRef[] = useMemo(
    () => [
      { id: 'cashflow', label: 'Cashflow Over Time', element: cashflowRef.current },
      { id: 'expenses', label: 'Expense Breakdown', element: expenseRef.current },
      { id: 'property', label: 'Property Comparison', element: propertyRef.current },
    ],
    [cashflowRef.current, expenseRef.current, propertyRef.current],
  );

  const hiddenPropertyCount = useMemo(() => {
    if (!propertyOptions.length || activeFilters.propertyIds.length === 0) return 0;
    const activeIds = new Set(propertyOptions.map((property) => property.id));
    return Array.from(activeIds).filter((id) => !activeFilters.propertyIds.includes(id)).length;
  }, [propertyOptions, activeFilters.propertyIds]);

  const handleBrushChange = (range: { from: string; to: string }) => {
    const monthRangeStart = toMonthRange(range.from);
    const monthRangeEnd = toMonthRange(range.to);
    if (monthRangeStart && monthRangeEnd) {
      setFilters((prev) => ({ ...prev, from: monthRangeStart.from, to: monthRangeEnd.to }));
    }
  };

  const kpiValues = {
    netCashflow: kpiQuery.data?.netCashflow,
    grossYield: kpiQuery.data?.grossYield ?? null,
    occupancyRate: kpiQuery.data?.occupancyRate ?? null,
    portfolioRoi: kpiQuery.data?.portfolioRoi ?? undefined,
  };

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/analytics"
            className="text-sm font-medium text-[#2F81F7] transition hover:text-[#1f6cd8]"
          >
            &larr; Back to Analytics
          </Link>
        </div>
        <OverviewHeader />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <KpiCards isLoading={kpiQuery.isLoading} values={kpiValues} />

            {!isLoading && !hasData ? (
              <section className="rounded-3xl border border-dashed border-slate-300/70 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-700 dark:bg-[#161B22]">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No data for this range</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Adjust your dates or clear filters to see more activity.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#2F81F7] hover:text-[#2F81F7] dark:border-[#1F2937] dark:text-slate-300"
                    onClick={() => setFilters(defaultState())}
                  >
                    Reset to FYTD
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#2F81F7] hover:text-[#2F81F7] dark:border-[#1F2937] dark:text-slate-300"
                    onClick={() => setFilters((prev) => ({ ...prev, propertyIds: [] }))}
                  >
                    Clear property filters
                  </button>
                </div>
              </section>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <CashflowChart
                    ref={cashflowRef}
                    data={cashflowQuery.data?.buckets ?? []}
                    onBrushChange={handleBrushChange}
                    isActive={chartView === 'cashflow'}
                  />
                  <ExpenseBreakdown
                    ref={expenseRef}
                    data={breakdownQuery.data?.items ?? []}
                    total={breakdownQuery.data?.total ?? 0}
                    selectedCategory={filters.expenseCategory}
                    onSelectCategory={(category) =>
                      setFilters((prev) => ({ ...prev, expenseCategory: category ?? undefined }))
                    }
                    isActive={chartView === 'expenses'}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-12">
                  <div className="xl:col-span-5">
                    <ObligationsCard items={upcomingQuery.data?.items ?? []} />
                  </div>
                  <div className="xl:col-span-4">
                    <PropertyComparison
                      ref={propertyRef}
                      data={propertySeriesQuery.data?.items ?? []}
                      hiddenCount={hiddenPropertyCount}
                      isActive={chartView === 'yield'}
                    />
                  </div>
                  <div className="xl:col-span-3">
                    <RentMarketCard onConnect={() => {}} />
                  </div>
                </div>
              </>
            )}
          </div>
          <FiltersPanel
            filters={filters}
            onUpdateFilters={(next) => setFilters((prev) => ({ ...prev, ...next }))}
            propertyOptions={propertyOptions}
            onPropertyChange={(ids) => setFilters((prev) => ({ ...prev, propertyIds: ids }))}
            csvSections={csvSections}
            charts={charts}
            chartView={chartView}
            onChartViewChange={(view) => setChartView(view)}
          />
        </div>
      </div>
    </div>
  );
}

function AnalyticsOverviewPage() {
  return (
    <AnalyticsFiltersProvider>
      <AnalyticsOverviewContent />
    </AnalyticsFiltersProvider>
  );
}

export default AnalyticsOverviewPage;
