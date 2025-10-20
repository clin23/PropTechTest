'use client';

import Skeleton from '../Skeleton';
import { formatValue } from './formatters';

type KpiCardsProps = {
  isLoading: boolean;
  values: {
    netCashflow?: number | null;
    grossYield?: number | null;
    occupancyRate?: number | null;
    portfolioRoi?: number | null | undefined;
  };
};

type MetricConfig = {
  key: keyof KpiCardsProps['values'];
  label: string;
  format: 'currency' | 'percentage' | 'number';
  precision?: number;
  helper?: string;
};

const CARD_BASE = [
  'rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F81F7]',
  'hover:border-[#2F81F7]/60 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5',
  'dark:border-[#1F2937] dark:bg-[#161B22] dark:hover:border-[#2F81F7]/60',
].join(' ');

const METRICS: MetricConfig[] = [
  { key: 'netCashflow', label: 'Net Cashflow', format: 'currency', precision: 0 },
  { key: 'grossYield', label: 'Gross Yield', format: 'percentage', precision: 1, helper: 'Add property valuations to surface yield' },
  { key: 'occupancyRate', label: 'Occupancy Rate', format: 'percentage', precision: 1, helper: 'Track vacancies to lift occupancy' },
  { key: 'portfolioRoi', label: 'Portfolio ROI', format: 'percentage', precision: 1, helper: 'Connect market values to unlock ROI' },
];

export default function KpiCards({ isLoading, values }: KpiCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio KPIs">
      {METRICS.map((metric) => {
        const raw = values[metric.key];
        const hasValue = raw !== null && raw !== undefined;
        return (
          <article
            key={metric.key}
            tabIndex={0}
            className={CARD_BASE}
            role="status"
            aria-live="polite"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
            <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
              ) : hasValue ? (
                formatValue(raw as number, metric.format, metric.precision)
              ) : (
                <span className="text-base font-medium text-slate-400">—</span>
              )}
            </div>
            {!isLoading && !hasValue && metric.helper && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{metric.helper}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
