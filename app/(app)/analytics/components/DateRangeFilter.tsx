import { useState } from 'react';
import type { AnalyticsStateType } from '../../../lib/schemas';

interface Props {
  state: AnalyticsStateType;
  onChange: (s: Partial<AnalyticsStateType>) => void;
}

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
}

function fromDayOfYear(year: number, day: number) {
  const start = new Date(year, 0, 1);
  return new Date(start.getTime() + (day - 1) * 86400000);
}

export default function DateRangeFilter({ state, onChange }: Props) {
  const [showCal, setShowCal] = useState(false);
  const from = new Date(state.from);
  const to = new Date(state.to);

  const update = (a: Date, b: Date) =>
    onChange({ from: a.toISOString(), to: b.toISOString() });

  const handleYear = (idx: 0 | 1, val: number) => {
    const a = new Date(state.from);
    const b = new Date(state.to);
    if (idx === 0) a.setFullYear(val); else b.setFullYear(val);
    update(a, b);
  };

  const handleDay = (idx: 0 | 1, val: number) => {
    const a = fromDayOfYear(new Date(state.from).getFullYear(), idx === 0 ? val : dayOfYear(new Date(state.from)));
    const b = fromDayOfYear(new Date(state.to).getFullYear(), idx === 1 ? val : dayOfYear(new Date(state.to)));
    update(a, b);
  };

  return (
    <div
      data-testid="date-range-filter"
      className="relative p-4 border rounded-2xl shadow-sm select-none"
      onClick={() => setShowCal(true)}
    >
      <div className="font-semibold mb-2">Date Range</div>
      <div className="text-sm mb-2">{state.from.slice(0, 10)} → {state.to.slice(0, 10)}</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <input
            type="range"
            min="2000"
            max="2100"
            value={from.getFullYear()}
            onChange={e => handleYear(0, Number(e.target.value))}
            className="w-full"
          />
          <input
            type="range"
            min="2000"
            max="2100"
            value={to.getFullYear()}
            onChange={e => handleYear(1, Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <input
            type="range"
            min="1"
            max="365"
            value={dayOfYear(from)}
            onChange={e => handleDay(0, Number(e.target.value))}
            className="w-full"
          />
          <input
            type="range"
            min="1"
            max="365"
            value={dayOfYear(to)}
            onChange={e => handleDay(1, Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      {showCal && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20"
          onClick={() => setShowCal(false)}
        >
          <div
            className="bg-white p-4 rounded shadow-md space-y-2"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="date"
              value={state.from.slice(0, 10)}
              onChange={e => update(new Date(e.target.value), to)}
              className="border p-1 rounded"
            />
            <input
              type="date"
              value={state.to.slice(0, 10)}
              onChange={e => update(from, new Date(e.target.value))}
              className="border p-1 rounded"
            />
            <button
              className="px-2 py-1 text-sm bg-gray-200 rounded"
              onClick={() => setShowCal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
