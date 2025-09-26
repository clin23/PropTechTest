'use client';

type UpcomingItem = {
  type: 'lease' | 'insurance' | 'smokeAlarm' | 'inspection';
  label: string;
  dueOn: string;
  propertyLabel: string;
};

type Props = {
  items: UpcomingItem[];
  onItemClick?: (item: UpcomingItem) => void;
};

const badgeStyles: Record<UpcomingItem['type'], string> = {
  lease: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  insurance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  smokeAlarm: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200',
  inspection: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function UpcomingList({ items, onItemClick }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm" role="region" aria-label="Upcoming obligations">
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Upcoming Obligations</h3>
      <ul className="mt-4 space-y-3 text-sm">
        {items.length === 0 && (
          <li className="text-gray-500">No upcoming items in this range.</li>
        )}
        {items.map((item) => (
          <li key={`${item.type}-${item.label}-${item.dueOn}`}>
            <button
              type="button"
              onClick={() => onItemClick?.(item)}
              className="w-full rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[item.type]}`}>
                      {item.type === 'smokeAlarm' ? 'Smoke alarm' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(item.dueOn)}</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.propertyLabel}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UpcomingList;
