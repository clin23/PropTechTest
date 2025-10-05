'use client';

import { forwardRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import { formatValue } from './formatters';

type PropertyPoint = {
  propertyId: string;
  propertyLabel: string;
  net: number;
};

type PropertyComparisonProps = {
  data: PropertyPoint[];
  hiddenCount?: number;
  isActive?: boolean;
};

const CARD_CLASS = [
  'rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300',
  'dark:border-[#1F2937] dark:bg-[#161B22] hover:border-[#2F81F7]/50',
].join(' ');

const ACTIVE_RING =
  'ring-2 ring-[#2F81F7]/80 ring-offset-2 ring-offset-white dark:ring-offset-[#0E1117]';

const PropertyComparison = forwardRef<HTMLDivElement, PropertyComparisonProps>(
  ({ data, hiddenCount = 0, isActive }, ref) => (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label="Net cashflow by property"
      className={[CARD_CLASS, isActive ? ACTIVE_RING : '', 'outline-none'].join(' ').trim()}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Property Comparison</h2>
        {hiddenCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2F81F7]/15 px-2 py-0.5 text-xs font-medium text-[#2F81F7]">
            +{hiddenCount}
          </span>
        )}
      </div>
      <div className="mt-4 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, rgba(148,163,184,0.35))" />
            <XAxis
              dataKey="propertyLabel"
              tick={{ fontSize: 12, fill: 'var(--axis-color, #64748b)' }}
              interval={0}
              angle={-25}
              height={70}
              textAnchor="end"
            />
            <YAxis
              width={90}
              tick={{ fontSize: 12, fill: 'var(--axis-color, #64748b)' }}
              tickFormatter={(value) => formatValue(value as number, 'currency')}
            />
            <Tooltip formatter={(value: number) => formatValue(value, 'currency')} />
            <Legend formatter={() => 'Net cashflow'} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="net" fill="var(--chart-2)" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  ),
);

PropertyComparison.displayName = 'PropertyComparison';

export default PropertyComparison;
