'use client';

import { forwardRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

type Item = {
  category: string;
  value: number;
};

type Props = {
  data: Item[];
  total: number;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
};

const COLOURS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
];

function formatPercentage(value: number, total: number) {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

const ChartExpenseDonut = forwardRef<HTMLDivElement, Props>(
  ({ data, total, selectedCategory, onSelectCategory }, ref),
) => {
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm"
      role="img"
      aria-label="Expense breakdown"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Expense Breakdown</h3>
        {selectedCategory && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => onSelectCategory?.(null)}
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              onClick={(entry) => {
                const category = entry.category as string;
                if (selectedCategory === category) {
                  onSelectCategory?.(null);
                } else {
                  onSelectCategory?.(category);
                }
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={COLOURS[index % COLOURS.length]}
                  opacity={selectedCategory && selectedCategory !== entry.category ? 0.4 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, entry) => {
                const percentage = formatPercentage(entry.value as number, total);
                return [`${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })} (${percentage})`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

ChartExpenseDonut.displayName = 'ChartExpenseDonut';

export default ChartExpenseDonut;
