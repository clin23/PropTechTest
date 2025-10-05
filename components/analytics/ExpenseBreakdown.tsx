'use client';

import { forwardRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const CARD_CLASS = [
  'rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300',
  'dark:border-[#1F2937] dark:bg-[#161B22] hover:border-[#2F81F7]/50',
].join(' ');

const ACTIVE_RING =
  'ring-2 ring-[#2F81F7]/80 ring-offset-2 ring-offset-white dark:ring-offset-[#0E1117]';

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

type BreakdownItem = {
  category: string;
  value: number;
};

type ExpenseBreakdownProps = {
  data: BreakdownItem[];
  total: number;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  isActive?: boolean;
};

function formatPercentage(value: number, total: number) {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

const ExpenseBreakdown = forwardRef<HTMLDivElement, ExpenseBreakdownProps>(
  ({ data, total, selectedCategory, onSelectCategory, isActive }, ref) => {
    const handleSelect = (category: string) => {
      if (selectedCategory === category) {
        onSelectCategory?.(null);
      } else {
        onSelectCategory?.(category);
      }
    };

    return (
      <section
        ref={ref}
        tabIndex={-1}
        aria-label="Expense breakdown"
        className={[CARD_CLASS, isActive ? ACTIVE_RING : '', 'outline-none'].join(' ').trim()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Expense Breakdown</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click a slice to filter expenses</p>
          </div>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory?.(null)}
              className="rounded-full border border-transparent bg-[#2F81F7]/10 px-3 py-1 text-xs font-medium text-[#2F81F7] transition hover:bg-[#2F81F7]/20"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="category"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                onClick={(entry) => handleSelect(entry.category as string)}
              >
                {data.map((entry, index) => {
                  const isDimmed = !!selectedCategory && selectedCategory !== entry.category;
                  return (
                    <Cell
                      key={entry.category}
                      fill={COLOURS[index % COLOURS.length]}
                      opacity={isDimmed ? 0.35 : 1}
                      strokeWidth={isDimmed ? 1 : 2}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, entry) => {
                  const percentage = formatPercentage(entry.value as number, total);
                  return [`${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })} (${percentage})`, name];
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    );
  },
);

ExpenseBreakdown.displayName = 'ExpenseBreakdown';

export default ExpenseBreakdown;
