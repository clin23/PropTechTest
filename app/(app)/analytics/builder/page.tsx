'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { saveProject, getProject } from '../../../../lib/savedAnalytics';
import DateRangeFilter from '../components/DateRangeFilter';
import AppliedFiltersPanel from '../components/AppliedFiltersPanel';
import SearchIncomePanel from '../components/SearchIncomePanel';
import SearchExpensesPanel from '../components/SearchExpensesPanel';
import VizLine from '../components/VizLine';
import VizPie from '../components/VizPie';
import CustomGraphBuilder from '../components/CustomGraphBuilder';
import ExportButtons from '../components/ExportButtons';
import VizSpreadsheet from '../components/VizSpreadsheet';
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

  useEffect(() => {
    const savedId = params.get('saved');
    if (savedId) {
      const project = getProject(savedId);
      if (project) {
        setState(project.state);
        setLocked(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtersApplied = Object.values(state.filters).some(arr => (arr || []).length > 0);
  const hasIncomeFilters = (state.filters.incomeTypes || []).length > 0;
  const hasExpenseFilters = (state.filters.expenseTypes || []).length > 0;

  const lineData = filtersApplied ? data?.buckets || [] : [];
  const pieData = (filtersApplied ? data?.buckets || [] : []).map(b => ({ label: b.label, value: b[state.metric] }));

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

  return (
    <div className="flex">
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
        <div ref={exportRef} className="space-y-2">
          <div data-testid="viz-section">
            {state.viz === 'line' && (
              <div className="space-y-4">
                <div className="border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg p-4">
                  <VizLine
                    data={lineData}
                    showIncome={showIncome}
                    showExpenses={showExpenses}
                    showNet={showNet}
                  />
                </div>
                <div className="border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg p-4">
                  <VizSpreadsheet
                    data={lineData}
                    showIncome={showIncome}
                    showExpenses={showExpenses}
                    showNet={showNet}
                  />
                </div>
              </div>
            )}
            {state.viz === 'pie' && <VizPie data={pieData} />}
            {state.viz === 'custom' && <CustomGraphBuilder onRun={() => {}} />}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>
              Date range: {new Date(state.from).toLocaleDateString()} - {new Date(state.to).toLocaleDateString()}
            </div>
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
        <ExportButtons csvData={JSON.stringify(lineData)} targetRef={exportRef} />
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
