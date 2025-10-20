'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDate, startOfFinancialYear } from '../../app/(app)/analytics/overview/lib/urlState';

type DateRangeValue = {
  from: string;
  to: string;
};

type PresetKey = 'this_month' | 'last_3_months' | 'fytd' | 'last_fy' | 'custom';

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue, preset?: PresetKey) => void;
};

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'fytd', label: 'FYTD' },
  { key: 'last_fy', label: 'Last FY' },
];

function computePresetRange(key: PresetKey, today = new Date()): DateRangeValue {
  const end = new Date(today);
  switch (key) {
    case 'this_month': {
      const from = new Date(end.getFullYear(), end.getMonth(), 1);
      return { from: formatDate(from), to: formatDate(end) };
    }
    case 'last_3_months': {
      const from = new Date(end.getFullYear(), end.getMonth() - 2, 1);
      return { from: formatDate(from), to: formatDate(end) };
    }
    case 'fytd': {
      const from = startOfFinancialYear(end);
      return { from: formatDate(from), to: formatDate(end) };
    }
    case 'last_fy': {
      const fyStart = startOfFinancialYear(end);
      const start = new Date(fyStart.getFullYear() - 1, fyStart.getMonth(), fyStart.getDate());
      const finish = new Date(fyStart.getTime() - 24 * 60 * 60 * 1000);
      return { from: formatDate(start), to: formatDate(finish) };
    }
    default:
      return { from: formatDate(end), to: formatDate(end) };
  }
}

function isSameRange(a: DateRangeValue, b: DateRangeValue) {
  return a.from === b.from && a.to === b.to;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [customFrom, setCustomFrom] = useState(value.from);
  const [customTo, setCustomTo] = useState(value.to);

  useEffect(() => {
    setCustomFrom(value.from);
    setCustomTo(value.to);
  }, [value.from, value.to]);

  const activePreset = useMemo(() => {
    for (const preset of PRESETS) {
      const range = computePresetRange(preset.key);
      if (isSameRange(range, value)) {
        return preset.key;
      }
    }
    return undefined;
  }, [value]);

  const handlePresetClick = (key: PresetKey) => {
    const range = computePresetRange(key);
    setCustomFrom(range.from);
    setCustomTo(range.to);
    onChange(range, key);
  };

  const handleCustomChange = (next: DateRangeValue) => {
    const fromDate = new Date(next.from);
    const toDate = new Date(next.to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return;
    if (fromDate > toDate) return;
    onChange(next, 'custom');
  };

  return (
    <div className="space-y-3" data-testid="date-range-picker">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Date range presets">
        {PRESETS.map((preset) => {
          const isActive = preset.key === activePreset;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePresetClick(preset.key)}
              className={[
                'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                isActive
                  ? 'border-[#2F81F7] bg-[#2F81F7] text-white shadow-sm'
                  : 'border-slate-200/80 text-slate-600 hover:border-[#2F81F7] hover:text-[#2F81F7] dark:border-[#1F2937] dark:text-slate-300',
              ].join(' ')}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <label className="flex items-center gap-2" htmlFor="overview-from">
          <span className="w-12 text-slate-500 dark:text-slate-400">From</span>
          <input
            id="overview-from"
            type="date"
            value={customFrom}
            onChange={(event) => {
              const next = event.target.value;
              setCustomFrom(next);
              handleCustomChange({ from: next, to: customTo });
            }}
            className="flex-1 rounded-xl border border-slate-200/70 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F81F7] dark:border-[#1F2937]"
          />
        </label>
        <label className="flex items-center gap-2" htmlFor="overview-to">
          <span className="w-12 text-slate-500 dark:text-slate-400">To</span>
          <input
            id="overview-to"
            type="date"
            value={customTo}
            onChange={(event) => {
              const next = event.target.value;
              setCustomTo(next);
              handleCustomChange({ from: customFrom, to: next });
            }}
            className="flex-1 rounded-xl border border-slate-200/70 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F81F7] dark:border-[#1F2937]"
          />
        </label>
      </div>
    </div>
  );
}
