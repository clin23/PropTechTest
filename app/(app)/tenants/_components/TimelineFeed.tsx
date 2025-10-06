'use client';

import { useMemo, useState } from 'react';

import type { TimelineEventBase } from '../../../../lib/tenants/types';

const FILTER_OPTIONS: Array<{ value: TimelineEventBase['type']; label: string }> = [
  { value: 'NOTE', label: 'Notes' },
  { value: 'TASK', label: 'Tasks' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'PAYMENT', label: 'Payments' },
  { value: 'MESSAGE', label: 'Messages' },
  { value: 'LEDGER', label: 'Ledger' },
  { value: 'INSPECTION', label: 'Inspections' },
  { value: 'TENANCY', label: 'Tenancies' },
];

interface TimelineFeedProps {
  events: TimelineEventBase[];
}

export function TimelineFeed({ events }: TimelineFeedProps) {
  const [activeFilters, setActiveFilters] = useState(() => new Set(FILTER_OPTIONS.map((option) => option.value)));

  const toggleFilter = (type: TimelineEventBase['type']) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    return events
      .filter((event) => activeFilters.has(event.type))
      .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
  }, [events, activeFilters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const active = activeFilters.has(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleFilter(option.value)}
              className={`rounded-full border px-3 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-sm text-muted-foreground">
            No timeline events match your filters.
          </p>
        ) : (
          filtered.map((event) => (
            <article key={event.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{formatType(event.type)}</span>
                <time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString()}</time>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">{event.summary}</p>
              {event.description ? <p className="mt-1 text-sm text-muted-foreground">{event.description}</p> : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function formatType(type: TimelineEventBase['type']) {
  switch (type) {
    case 'NOTE':
      return 'Note';
    case 'TASK':
      return 'Task';
    case 'MAINTENANCE':
      return 'Maintenance';
    case 'PAYMENT':
      return 'Payment';
    case 'MESSAGE':
      return 'Message';
    case 'LEDGER':
      return 'Ledger';
    case 'INSPECTION':
      return 'Inspection';
    case 'TENANCY':
      return 'Tenancy';
    default:
      return type;
  }
}
