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

  const chartData = data?.buckets || [];

  return (
    <div className="flex">
      <div className="flex-1 p-6 space-y-4">
        <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
        <div data-testid="viz-section">
          {state.viz === 'line' && <VizLine data={chartData} />}
          {state.viz === 'pie' && <VizPie data={chartData} />}
          {state.viz === 'custom' && <CustomGraphBuilder onRun={() => {}} />}
        </div>
        <ExportButtons csvData={JSON.stringify(chartData)} />
      </div>
      <div className="w-80 p-4 space-y-4 hidden lg:block">
        <DateRangeFilter state={state} onChange={() => {}} />
        <AppliedFiltersPanel state={state} onRemove={() => {}} />
        <SearchIncomePanel />
        <SearchExpensesPanel />
        <PresetMenu />
      </div>
    </div>
  );
}
