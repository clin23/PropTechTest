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
import { formatValue } from './KpiCard';

type Bucket = {
  label: string;
  income: number;
  expenses: number;
  net: number;
};

type Props = {
  data: Bucket[];
  onBrushChange?: (range: { from: string; to: string }) => void;
};

const SERIES = [
  { key: 'income' as const, label: 'Income', colour: 'var(--chart-2)' },
  { key: 'expenses' as const, label: 'Expenses', colour: 'var(--chart-5)' },
  { key: 'net' as const, label: 'Net', colour: 'var(--chart-1)' },
];

function formatCurrency(value: number) {
  return formatValue(value, 'currency');
}

const ChartCashflow = forwardRef<HTMLDivElement, Props>(({ data, onBrushChange }, ref) => {
  const [activeKeys, setActiveKeys] = useState(() => new Set(SERIES.map((item) => item.key)));

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

  const lines = useMemo(() => SERIES.filter((item) => activeKeys.has(item.key)), [activeKeys]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm"
      role="img"
      aria-label="Cashflow over time"
    >
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Cashflow Over Time</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, rgba(148, 163, 184, 0.3))" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={16} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value as number)}
              width={90}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: 'var(--chart-1)' }}
              formatter={(value: number, name) => [formatCurrency(value), name]}
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
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Brush
              travellerWidth={12}
              height={24}
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
    </div>
  );
});

ChartCashflow.displayName = 'ChartCashflow';

export default ChartCashflow;
