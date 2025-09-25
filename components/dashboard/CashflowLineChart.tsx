'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useRouter } from 'next/navigation';

import type { TimeSeriesPoint } from '../../types/dashboard';
import { formatMoney, formatChartDate } from '../../lib/format';

interface Props {
  data: TimeSeriesPoint[];
}

type ChartMode = 'running' | 'cumulative';

export default function CashflowLineChart({ data }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<ChartMode>('running');

  const chartData = useMemo(() => {
    if (mode === 'running') {
      return data;
    }

    let runningCashIn = 0;
    let runningCashOut = 0;
    let runningNet = 0;

    return data.map((point) => {
      runningCashIn += point.cashInCents;
      runningCashOut += point.cashOutCents;
      runningNet += point.netCents;

      return {
        ...point,
        cashInCents: runningCashIn,
        cashOutCents: runningCashOut,
        netCents: runningNet,
      } satisfies TimeSeriesPoint;
    });
  }, [data, mode]);

  const handleNavigate = () => {
    router.push('/analytics/overview');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  };

  const handleToggleClick = (event: MouseEvent<HTMLButtonElement>, nextMode: ChartMode) => {
    event.stopPropagation();
    setMode(nextMode);
  };

  const title = mode === 'running' ? 'Running Cashflow' : 'Cumulative Cashflow';

  return (
    <div
      className="p-4 rounded-2xl card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
      role="link"
      tabIndex={0}
      aria-label="View analytics overview"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => handleToggleClick(event, 'running')}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
              mode === 'running'
                ? 'border-transparent bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)]'
            }`}
            aria-label="Show running cashflow"
            aria-pressed={mode === 'running'}
          >
            <RunningLineIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => handleToggleClick(event, 'cumulative')}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
              mode === 'cumulative'
                ? 'border-transparent bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)]'
            }`}
            aria-label="Show cumulative cashflow"
            aria-pressed={mode === 'cumulative'}
          >
            <CumulativeLineIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 16, right: 48, bottom: 0, left: 32 }}>
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

function RunningLineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 16 7.5 11 12 14 16 7 21 13" />
      <circle cx="7.5" cy="11" r="1.2" fill="currentColor" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" />
      <circle cx="16" cy="7" r="1.2" fill="currentColor" />
      <circle cx="21" cy="13" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CumulativeLineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17h18" strokeOpacity={0.4} />
      <path d="M3 12h18" strokeOpacity={0.4} />
      <path d="M3 7h18" strokeOpacity={0.4} />
      <path
        d="M4 16L8 12L12 13L16 9L20 8V16H4Z"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
      />
    </svg>
  );
}
