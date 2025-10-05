'use client';

import { forwardRef, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
} from 'recharts';
import { formatCurrency, formatValue } from './formatters';

type CashflowPoint = {
  label: string;
  income: number;
  expenses: number;
  net: number;
};

type CashflowChartProps = {
  data: CashflowPoint[];
  onBrushChange?: (range: { from: string; to: string }) => void;
  isActive?: boolean;
};

const SERIES = [
  { key: 'income' as const, label: 'Income', colour: 'var(--chart-2)' },
  { key: 'expenses' as const, label: 'Expenses', colour: 'var(--chart-5)' },
  { key: 'net' as const, label: 'Net', colour: 'var(--chart-1)' },
];

const CARD_CLASS = [
  'rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300',
  'focus-within:ring-[#2F81F7] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white',
  'dark:border-[#1F2937] dark:bg-[#161B22] dark:focus-within:ring-offset-[#0E1117]',
].join(' ');

const ACTIVE_RING =
  'ring-2 ring-[#2F81F7]/80 ring-offset-2 ring-offset-white dark:ring-offset-[#0E1117]';

const CashflowChart = forwardRef<HTMLDivElement, CashflowChartProps>(({ data, onBrushChange, isActive }, ref) => {
  const [activeKeys, setActiveKeys] = useState(() => new Set(SERIES.map((item) => item.key)));

  const lines = useMemo(() => SERIES.filter((item) => activeKeys.has(item.key)), [activeKeys]);

  const handleLegendClick = (key: typeof SERIES[number]['key']) => {
    setActiveKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        if (next.size > 1) {
          next.delete(key);
        }
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label="Cashflow over time"
      className={[CARD_CLASS, isActive ? ACTIVE_RING : '', 'outline-none'].join(' ').trim()}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Cashflow Over Time</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Income, expenses &amp; net trend</p>
      </div>
      <div className="mt-4 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, rgba(148,163,184,0.35))" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--axis-color, #64748b)' }} minTickGap={16} />
            <YAxis
              width={90}
              tick={{ fontSize: 12, fill: 'var(--axis-color, #64748b)' }}
              tickFormatter={(value) => formatCurrency(value as number)}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: 'var(--chart-1)' }}
              formatter={(value: number, name) => [formatValue(value, 'currency', 0), name]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend
              onClick={(entry) => handleLegendClick(entry.dataKey as typeof SERIES[number]['key'])}
              wrapperStyle={{ fontSize: 12 }}
            />
            {lines.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.colour}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
                animationDuration={400}
              />
            ))}
            <Brush
              travellerWidth={12}
              height={28}
              stroke="var(--chart-1)"
              onChange={(range) => {
                if (!range || range.startIndex === undefined || range.endIndex === undefined) return;
                const fromBucket = data[range.startIndex];
                const toBucket = data[range.endIndex];
                if (!fromBucket || !toBucket) return;
                onBrushChange?.({ from: fromBucket.label, to: toBucket.label });
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});

CashflowChart.displayName = 'CashflowChart';

export default CashflowChart;
