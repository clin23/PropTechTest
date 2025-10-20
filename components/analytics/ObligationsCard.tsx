'use client';

type UpcomingItem = {
  type: 'lease' | 'insurance' | 'smokeAlarm' | 'inspection';
  label: string;
  dueOn: string;
  propertyLabel: string;
};

type ObligationsCardProps = {
  items: UpcomingItem[];
  onItemClick?: (item: UpcomingItem) => void;
};

const CARD_CLASS = [
  'rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300',
  'dark:border-[#1F2937] dark:bg-[#161B22] hover:border-[#2F81F7]/40',
].join(' ');

const badgeStyles: Record<UpcomingItem['type'], string> = {
  lease: 'bg-[#2F81F7]/15 text-[#2F81F7]',
  insurance: 'bg-emerald-500/15 text-emerald-400',
  smokeAlarm: 'bg-orange-500/15 text-orange-400',
  inspection: 'bg-purple-500/15 text-purple-300',
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ObligationsCard({ items, onItemClick }: ObligationsCardProps) {
  return (
    <section className={CARD_CLASS} aria-label="Upcoming obligations">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upcoming Obligations</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">Auto-syncs with reminders</span>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No upcoming items in this range.
          </li>
        )}
        {items.map((item) => (
          <li key={`${item.type}-${item.label}-${item.dueOn}`}>
            <button
              type="button"
              onClick={() => onItemClick?.(item)}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-[#2F81F7]/50 hover:bg-[#2F81F7]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F81F7] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0E1117]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[item.type]}`}>
                    {item.type === 'smokeAlarm' ? 'Smoke alarm' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.dueOn)}</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.propertyLabel}</p>
              </div>
              <span aria-hidden className="text-lg text-slate-400">&rsaquo;</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
