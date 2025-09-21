'use client';

import type { KeyboardEvent } from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useRouter } from 'next/navigation';

import type { TimeSeriesPoint } from '../../types/dashboard';
import { formatMoney, formatChartDate } from '../../lib/format';

interface Props {
  data: TimeSeriesPoint[];
}

export default function CashflowLineChart({ data }: Props) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/analytics/overview');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      className="p-4 rounded-2xl card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
      role="link"
      tabIndex={0}
      aria-label="View analytics overview"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 16, right: 48, bottom: 0, left: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatChartDate(d)}
            tick={{ fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tickMargin={12}
          />
          <YAxis
            tickFormatter={(v) => formatMoney(v)}
            tick={{ fill: 'var(--text-secondary)', textAnchor: 'end' }}
            tickMargin={12}
            width={76}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip formatter={(v: number) => formatMoney(v)} labelFormatter={(l) => formatChartDate(l)} />
          <Legend />
          <Line type="monotone" dataKey="cashInCents" name="Cash In" stroke="#22c55e" />
          <Line type="monotone" dataKey="cashOutCents" name="Cash Out" stroke="#ef4444" />
          <Line type="monotone" dataKey="netCents" name="Net" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
