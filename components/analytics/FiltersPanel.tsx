'use client';

import DateRangePicker from './DateRangePicker';
import PropertyMultiSelect, { type PropertyOption } from './PropertyMultiSelect';
import ExportButtons, { type ChartRef, type CsvSection } from './ExportButtons';
import { type ChartView } from './FiltersProvider';
import type { OverviewState } from '../../app/(app)/analytics/overview/lib/urlState';

type FiltersPanelProps = {
  filters: OverviewState;
  onUpdateFilters: (next: Partial<OverviewState>) => void;
  propertyOptions: PropertyOption[];
  onPropertyChange: (ids: string[]) => void;
  csvSections: CsvSection[];
  charts: ChartRef[];
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
};

const PANEL_CLASS = [
  'space-y-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm',
  'dark:border-[#1F2937] dark:bg-[#161B22] lg:sticky lg:top-24',
].join(' ');

const chartOptions: { value: ChartView; label: string; description: string }[] = [
  { value: 'cashflow', label: 'Cashflow', description: 'Income vs expenses trend' },
  { value: 'yield', label: 'Yield', description: 'Compare property cashflow' },
  { value: 'expenses', label: 'Expenses', description: 'Breakdown by category' },
];

export default function FiltersPanel({
  filters,
  onUpdateFilters,
  propertyOptions,
  onPropertyChange,
  csvSections,
  charts,
  chartView,
  onChartViewChange,
}: FiltersPanelProps) {
  return (
    <aside className="space-y-4">
      <section className={PANEL_CLASS} aria-label="Analytics filters">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Date range</h2>
            <DateRangePicker
              value={{ from: filters.from, to: filters.to }}
              onChange={(next) => onUpdateFilters(next)}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Properties</h2>
            <PropertyMultiSelect
              properties={propertyOptions}
              selected={filters.propertyIds}
              onChange={onPropertyChange}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Chart focus</h2>
            <div className="space-y-2 rounded-2xl border border-slate-200/70 p-3 dark:border-[#1F2937]">
              <label htmlFor="chart-view" className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Primary chart
              </label>
              <select
                id="chart-view"
                value={chartView}
                onChange={(event) => onChartViewChange(event.target.value as ChartView)}
                className="w-full rounded-xl border border-slate-200/70 bg-transparent px-3 py-2 text-sm text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-[#2F81F7] dark:border-[#1F2937] dark:text-slate-200"
              >
                {chartOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {chartOptions.find((option) => option.value === chartView)?.description}
              </p>
            </div>
          </div>
          {filters.expenseCategory && (
            <div className="rounded-2xl border border-[#2F81F7]/40 bg-[#2F81F7]/10 p-3 text-sm text-[#2F81F7]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Filtered category</span>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => onUpdateFilters({ expenseCategory: undefined })}
                >
                  Clear
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold">{filters.expenseCategory}</p>
            </div>
          )}
        </div>
      </section>
      <ExportButtons csvSections={csvSections} charts={charts} />
    </aside>
  );
}
