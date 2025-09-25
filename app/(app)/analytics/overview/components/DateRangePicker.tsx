'use client';

import { useMemo, useState } from 'react';
import { formatDate, startOfFinancialYear } from '../lib/urlState';

type DateRangeValue = {
  from: string;
  to: string;
};

type PresetKey = 'this_month' | 'last_3_months' | 'fytd' | 'last_fy' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'fytd', label: 'FYTD' },
  { key: 'last_fy', label: 'Last FY' },
];

type Props = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue, preset?: PresetKey) => void;
};

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

export function DateRangePicker({ value, onChange }: Props) {
  const [customFrom, setCustomFrom] = useState<string>(value.from);
  const [customTo, setCustomTo] = useState<string>(value.to);

  const activePreset = useMemo(() => {
    for (const preset of PRESETS) {
      const range = computePresetRange(preset.key);
      if (isSameRange(range, value)) return preset.key;
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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm space-y-3" data-testid="date-range-picker">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Date range presets">
        {PRESETS.map((preset) => {
          const isActive = preset.key === activePreset;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePresetClick(preset.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 text-sm" aria-label="Custom date range">
        <div className="flex items-center gap-2">
          <label className="w-16 text-gray-600 dark:text-gray-300" htmlFor="overview-from">
            From
          </label>
          <input
            id="overview-from"
            type="date"
            value={customFrom}
            onChange={(event) => {
              const next = event.target.value;
              setCustomFrom(next);
              handleCustomChange({ from: next, to: customTo });
            }}
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-16 text-gray-600 dark:text-gray-300" htmlFor="overview-to">
            To
          </label>
          <input
            id="overview-to"
            type="date"
            value={customTo}
            onChange={(event) => {
              const next = event.target.value;
              setCustomTo(next);
              handleCustomChange({ from: customFrom, to: next });
            }}
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default DateRangePicker;
