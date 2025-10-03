'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { saveProject, getProject } from '../../../../lib/savedAnalytics';
import DateRangeFilter from '../components/DateRangeFilter';
import AppliedFiltersPanel from '../components/AppliedFiltersPanel';
import SearchIncomePanel from '../components/SearchIncomePanel';
import SearchExpensesPanel from '../components/SearchExpensesPanel';
import CustomGraphBuilder from '../components/CustomGraphBuilder';
import ExportButtons from '../components/ExportButtons';
import VizSpreadsheet from '../components/VizSpreadsheet';
import ChartRenderer, { ChartKey } from '../components/ChartRenderer';
import { AnalyticsState, AnalyticsStateType } from '../../../../lib/schemas';
import { useUrlState } from '../../../../lib/urlState';
import { useSeries } from '../../../../hooks/useAnalytics';

const now = new Date();
const defaultState = AnalyticsState.parse({
  from: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString(),
  to: now.toISOString(),
});

export default function AnalyticsBuilderPage() {
  const [state, setState] = useState<AnalyticsStateType>(defaultState);
  const [locked, setLocked] = useState(false);
  useUrlState(state, setState);
  const { data } = useSeries(state);
  const exportRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();

  const savedProjectId = useMemo(() => params.get('saved'), [params]);

  useEffect(() => {
    if (!savedProjectId) {
      return;
    }

    const project = getProject(savedProjectId);
    if (project) {
      setState(project.state);
      setLocked(true);
    }
  }, [savedProjectId]);

  const filtersApplied = Object.values(state.filters).some(arr => (arr || []).length > 0);
  const hasIncomeFilters = (state.filters.incomeTypes || []).length > 0;
  const hasExpenseFilters = (state.filters.expenseTypes || []).length > 0;

  const dataset = filtersApplied ? data?.buckets || [] : [];

  let showIncome = filtersApplied;
  let showExpenses = filtersApplied;
  let showNet = filtersApplied;

  if (hasIncomeFilters && !hasExpenseFilters) {
    showExpenses = false;
    showNet = false;
  } else if (hasExpenseFilters && !hasIncomeFilters) {
    showIncome = false;
    showNet = false;
  }

  const baseSeries: ChartKey[] = [
    { key: 'income', label: 'Income', color: 'var(--chart-2)' },
    { key: 'expenses', label: 'Expenses', color: 'var(--chart-5)' },
    { key: 'net', label: 'Net', color: 'var(--chart-1)' },
  ];

  const metricSeries =
    baseSeries.find(series => series.key === state.metric) || baseSeries[2];

  const activeSeries = baseSeries.filter(series => {
    if (series.key === 'income') return showIncome;
    if (series.key === 'expenses') return showExpenses;
    if (series.key === 'net') return showNet;
    return true;
  });

  const vizTypes = [
    { value: 'line', label: 'Line Graph' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'donut', label: 'Donut Chart' },
    { value: 'histogram', label: 'Histogram' },
    { value: 'scatter', label: 'Scatter Plot' },
  ] as const;

  type StandardVizType = (typeof vizTypes)[number]['value'];
  const isCustomViz = state.viz === 'custom';
  const isStandardViz = vizTypes.some(option => option.value === state.viz);
  const chartType = (isStandardViz ? state.viz : 'line') as StandardVizType;

  const chartSeries =
    chartType === 'pie' || chartType === 'donut' || chartType === 'histogram'
      ? [metricSeries]
      : activeSeries.length
        ? activeSeries
        : [metricSeries];

  const fromDate = new Date(state.from);
  const toDate = new Date(state.to);
  const hasValidFrom = !Number.isNaN(fromDate.getTime());
  const hasValidTo = !Number.isNaN(toDate.getTime());
  const rangeInverted = hasValidFrom && hasValidTo && fromDate > toDate;
  const invalidDateMessage = !hasValidFrom || !hasValidTo
    ? 'We couldn\'t process the selected date range. Please review your filters.'
    : rangeInverted
      ? 'The start date occurs after the end date. Try adjusting the range.'
      : undefined;

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4 mt-2">
          <Link href="/analytics" className="text-blue-600 hover:underline">
            <span aria-hidden>&larr;</span>
            <span className="sr-only">Back to Analytics</span>
          </Link>
          <h1 className="text-2xl font-semibold">Analytics Builder</h1>
          <button
            onClick={() => {
              const name = prompt('Name your project');
              if (name) saveProject(name, state);
            }}
            className="ml-auto p-1 rounded hover:bg-white/20"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="sr-only">Save project</span>
          </button>
        </div>
        <div ref={exportRef} className="space-y-4">
          <div data-testid="viz-section" className="space-y-4">
            <div className="border rounded-xl bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Visualisation</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Explore your data with flexible chart types
                  </p>
                </div>
                <div className="ml-auto">
                  <select
                    value={state.viz}
                    onChange={(event) =>
                      setState(prev => ({ ...prev, viz: event.target.value as AnalyticsStateType['viz'] }))
                    }
                    className="w-44 rounded-lg border border-white/20 bg-white/20 px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100 dark:hover:bg-gray-900/60"
                  >
                    {vizTypes.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="custom">Custom Builder</option>
                  </select>
                </div>
              </div>
              {isCustomViz ? (
                <CustomGraphBuilder onRun={() => {}} />
              ) : (
                <ChartRenderer
                  type={chartType}
                  data={dataset}
                  xKey="label"
                  yKeys={chartSeries}
                  errorMessage={invalidDateMessage}
                />
              )}
            </div>
            <div className="border rounded-xl bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg p-4">
              <VizSpreadsheet
                data={dataset}
                showIncome={showIncome}
                showExpenses={showExpenses}
                showNet={showNet}
              />
            </div>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {invalidDateMessage ? (
              <div className="text-red-500 dark:text-red-300">{invalidDateMessage}</div>
            ) : (
              <div>
                Date range: {fromDate.toLocaleDateString()} - {toDate.toLocaleDateString()}
              </div>
            )}
            {filtersApplied && (
              <div className="flex flex-wrap items-center gap-2">
                <span>Filters:</span>
                {Object.entries(state.filters)
                  .filter(([, arr]) => (arr || []).length > 0)
                  .map(([key, arr]) =>
                    (arr || []).map(value => (
                      <span
                        key={`${key}-${value}`}
                        className={`px-2 py-0.5 rounded-full text-sm cursor-default ${
                          key === 'incomeTypes'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700'
                            : key === 'expenseTypes'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {value}
                      </span>
                    ))
                  )}
              </div>
            )}
          </div>
        </div>
        <ExportButtons csvData={JSON.stringify(dataset)} targetRef={exportRef} />
      </div>
      <div className="w-80 p-4 space-y-4 hidden lg:block">
        <DateRangeFilter state={state} onChange={(s) => setState(prev => ({ ...prev, ...s }))} />
        <AppliedFiltersPanel
          state={state}
          onAdd={locked ? () => {} : (key, value) =>
            setState(prev => ({
              ...prev,
              filters: {
                ...prev.filters,
                [key]: Array.from(new Set([...(prev.filters[key] || []), value])),
              },
            }))
          }
          onRemove={locked ? () => {} : (key, value) =>
            setState(prev => ({
              ...prev,
              filters: {
                ...prev.filters,
                [key]: (prev.filters[key] || []).filter(v => v !== value),
              },
            }))
          }
        />
        {!locked && (
          <SearchIncomePanel
            onAdd={value =>
              setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  incomeTypes: Array.from(
                    new Set([...(prev.filters.incomeTypes || []), value])
                  ),
                },
              }))
            }
          />
        )}
        {!locked && (
          <SearchExpensesPanel
            onAdd={value =>
              setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  expenseTypes: Array.from(
                    new Set([...(prev.filters.expenseTypes || []), value])
                  ),
                },
              }))
            }
          />
        )}
      </div>
    </div>
  );
}
