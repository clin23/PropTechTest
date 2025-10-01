'use client';

import { useEffect, useMemo, useRef } from 'react';

import { type TimelineEvent, useTimeline } from '../../lib/api/tenants';

interface TimelineTabProps {
  tenantId: string;
}

const ICONS: Record<TimelineEvent['type'], string> = {
  note: '📝',
  payment: '💳',
  job: '🛠️',
  message: '💬',
  lease: '📄',
};

export function TimelineTab({ tenantId }: TimelineTabProps) {
  const timelineQuery = useTimeline(tenantId);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const events = useMemo(() => timelineQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [], [
    timelineQuery.data,
  ]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) {
        timelineQuery.fetchNextPage();
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [timelineQuery]);

  const grouped = useMemo(() => groupEvents(events), [events]);

  if (timelineQuery.isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted/70" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-muted/80" />
              <div className="h-3 w-48 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Nothing here yet.</p>
        <p>Timeline updates as you log notes, payments, jobs, and communications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto px-6 py-6">
      {grouped.map((group) => (
        <section key={group.date} aria-label={group.date} className="space-y-3">
          <h3 className="sticky top-0 z-10 bg-surface/95 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.date}
          </h3>
          <ol className="space-y-3">
            {group.items.map((event) => (
              <li key={event.id} className="relative rounded-lg border border-border/60 bg-background/60 p-4">
                <div className="absolute -left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow">
                  <span aria-hidden>{ICONS[event.type]}</span>
                </div>
                <div className="ml-6 text-sm text-foreground">
                  <header className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="font-medium capitalize">{event.type}</span>
                    <span>{timeAgo(event.at)}</span>
                  </header>
                  <p className="mt-2 text-sm text-foreground">{describeEvent(event)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <div ref={sentinelRef} className="h-8" />
      {timelineQuery.isFetchingNextPage ? (
        <div className="flex items-center justify-center pb-6 text-xs text-muted-foreground">Loading…</div>
      ) : null}
    </div>
  );
}

function groupEvents(events: TimelineEvent[]) {
  const formatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const map = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const key = formatter.format(new Date(event.at));
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(event);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items: items.sort((a, b) => (a.at > b.at ? -1 : 1)) }));
}

function timeAgo(value: string) {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diff = now - then;
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes <= 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

function describeEvent(event: TimelineEvent) {
  switch (event.type) {
    case 'note':
      return event.snippet;
    case 'payment':
      return `Payment ${event.status === 'posted' ? 'posted' : 'late'} for $${event.amount.toFixed(2)}`;
    case 'job':
      return `${event.title} (${event.status})`;
    case 'message':
      return `${event.direction === 'in' ? 'Received' : 'Sent'} ${event.channel.toUpperCase()} message`;
    case 'lease':
      return `Lease ${event.event}`;
    default:
      return '';
  }
}

