'use client';
import { useState } from 'react';
import DateRangeFilter from './components/DateRangeFilter';
import AppliedFiltersPanel from './components/AppliedFiltersPanel';
import SearchIncomePanel from './components/SearchIncomePanel';
import SearchExpensesPanel from './components/SearchExpensesPanel';
import VizLine from './components/VizLine';
import VizPie from './components/VizPie';
import CustomGraphBuilder from './components/CustomGraphBuilder';
import ExportButtons from './components/ExportButtons';
import PresetMenu from './components/PresetMenu';
import { AnalyticsState, AnalyticsStateType } from '../../../lib/schemas';
import { useUrlState } from '../../../lib/urlState';
import { useSeries } from '../../../hooks/useAnalytics';

const now = new Date();
const defaultState = AnalyticsState.parse({
  from: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString(),
  to: now.toISOString(),
});

export default function AnalyticsPage() {
  const [state, setState] = useState<AnalyticsStateType>(defaultState);
  useUrlState(state, setState);
  const { data } = useSeries(state);

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
        <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
        <div data-testid="viz-section">
          {state.viz === 'line' && (
            <VizLine
              data={lineData}
              showIncome={showIncome}
              showExpenses={showExpenses}
              showNet={showNet}
            />
          )}
          {state.viz === 'pie' && <VizPie data={pieData} />}
          {state.viz === 'custom' && <CustomGraphBuilder onRun={() => {}} />}
        </div>
        <ExportButtons csvData={JSON.stringify(lineData)} />
      </div>
      <div className="w-80 p-4 space-y-4 hidden lg:block">
        <DateRangeFilter state={state} onChange={(s) => setState(prev => ({ ...prev, ...s }))} />
        <AppliedFiltersPanel
          state={state}
          onAdd={(key, value) =>
            setState(prev => ({
              ...prev,
              filters: {
                ...prev.filters,
                [key]: Array.from(new Set([...(prev.filters[key] || []), value])),
              },
            }))
          }
          onRemove={(key, value) =>
            setState(prev => ({
              ...prev,
              filters: {
                ...prev.filters,
                [key]: (prev.filters[key] || []).filter(v => v !== value),
              },
            }))
          }
        />
        <SearchIncomePanel />
        <SearchExpensesPanel />
        <PresetMenu />
      </div>
    </div>
  );
}
