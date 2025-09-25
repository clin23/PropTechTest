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
import { formatValue } from './KpiCard';

type Item = {
  propertyId: string;
  propertyLabel: string;
  net: number;
};

type Props = {
  data: Item[];
  hiddenCount?: number;
};

const ChartPropertyCompare = forwardRef<HTMLDivElement, Props>(({ data, hiddenCount = 0 }, ref) => {
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm"
      role="img"
      aria-label="Net cashflow by property"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Property Comparison</h3>
        {hiddenCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
            +{hiddenCount}
          </span>
        )}
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, rgba(148, 163, 184, 0.3))" />
            <XAxis dataKey="propertyLabel" tick={{ fontSize: 12 }} interval={0} angle={-20} height={70} textAnchor="end" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatValue(value as number, 'currency')} width={90} />
            <Tooltip formatter={(value: number) => formatValue(value, 'currency')} />
            <Legend formatter={() => 'Net cashflow'} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="net" fill="var(--chart-2)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

ChartPropertyCompare.displayName = 'ChartPropertyCompare';

export default ChartPropertyCompare;
