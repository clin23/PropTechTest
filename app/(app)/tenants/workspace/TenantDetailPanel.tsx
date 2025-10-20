'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { GuidedActions } from '../_components/GuidedActions';
import { HealthScoreBadge } from '../_components/HealthScoreBadge';
import { QuickActionsBar } from '../_components/QuickActionsBar';
import { TimelineFeed } from '../_components/TimelineFeed';
import type { TenantWorkspace, TimelineEventBase } from '../../../../lib/tenants/types';

interface TenantDetailPanelProps {
  tenant?: TenantWorkspace;
  isLoading: boolean;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'comms', label: 'Comms' },
  { id: 'tasks', label: 'Tasks/Notes' },
  { id: 'payments', label: 'Payments' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'files', label: 'Files' },
  { id: 'timeline', label: 'Timeline' },
] as const;

export function TenantDetailPanel({ tenant, isLoading }: TenantDetailPanelProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => params?.get('tab') ?? 'overview');

  useEffect(() => {
    const paramTab = params?.get('tab');
    if (paramTab && TABS.some((tab) => tab.id === paramTab)) {
      setActiveTab(paramTab);
    }
  }, [params]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const search = new URLSearchParams(params?.toString() ?? '');
    search.set('tab', tabId);
    router.replace(`?${search.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <div className="h-24 animate-pulse rounded-3xl bg-muted/40" />
        <div className="h-10 animate-pulse rounded-xl bg-muted/30" />
        <div className="flex-1 animate-pulse rounded-3xl bg-muted/20" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-sm text-muted-foreground">
        <p className="text-base font-semibold text-foreground">Select a tenant to view details</p>
        <p>Choose a tenant from the list to review communications, tasks, and health breakdown.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 px-6 py-5 backdrop-blur">
        <DetailHeader tenant={tenant} />
      </div>
      <nav className="border-b border-border/60 bg-surface/60 px-4">
        <div role="tablist" aria-label="Tenant detail tabs" className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`tenant-tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === 'overview' ? <OverviewTab tenant={tenant} /> : null}
        {activeTab === 'comms' ? <CommsTab tenant={tenant} /> : null}
        {activeTab === 'tasks' ? <TasksTab tenant={tenant} /> : null}
        {activeTab === 'payments' ? <PaymentsTab tenant={tenant} /> : null}
        {activeTab === 'jobs' ? <JobsTab tenant={tenant} /> : null}
        {activeTab === 'files' ? <FilesTab tenant={tenant} /> : null}
        {activeTab === 'timeline' ? <TimelineSection events={tenant.timeline} /> : null}
      </div>
    </div>
  );
}

function DetailHeader({ tenant }: { tenant: TenantWorkspace }) {
  const { summary } = tenant;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {summary.avatarInitials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-foreground">{summary.name}</h2>
              {summary.stage ? <Badge tone="neutral" label={summary.stage} /> : null}
              {summary.watchlist ? <Badge tone="amber" label="Watchlist" /> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {[summary.email, summary.phone, summary.address].filter(Boolean).join(' · ') || 'No contact details'}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {summary.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase">
                  {tag.replace('_', ' ')}
                </span>
              ))}
              <HealthScoreBadge score={summary.healthScore} />
            </div>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          {summary.currentTenancy ? (
            <span>
              <span className="font-medium text-foreground">Current tenancy:</span>{' '}
              {summary.currentTenancy.propertyLabel} · {formatCurrency(summary.currentTenancy.rentCents)} /
              {summary.currentTenancy.frequency.toLowerCase()}
            </span>
          ) : (
            <span className="font-medium text-foreground">No active tenancy</span>
          )}
          {summary.lastTouchpointAt ? (
            <span>
              <span className="font-medium text-foreground">Last interaction:</span> {formatRelative(summary.lastTouchpointAt)}
            </span>
          ) : null}
        </div>
      </div>
      {summary.healthBreakdown ? <HealthBreakdown breakdown={summary.healthBreakdown} /> : null}
      <QuickActionsBar tenantId={summary.id} tenantName={summary.name} />
    </div>
  );
}

function OverviewTab({ tenant }: { tenant: TenantWorkspace }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Tenancy history</h3>
            {tenant.tenancies.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No tenancy records yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {tenant.tenancies.map((tenancy) => (
                  <li key={tenancy.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tenancy.propertyLabel}</span>
                      <span>
                        {formatDate(tenancy.startDate)} – {tenancy.endDate ? formatDate(tenancy.endDate) : 'Current'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {formatCurrency(tenancy.rentCents)} / {tenancy.frequency.toLowerCase()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Notes snapshot</h3>
            {tenant.notes.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No notes logged yet.</p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                {tenant.notes.slice(0, 3).map((note) => (
                  <li key={note.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2">
                    <p className="font-medium text-foreground">{note.author}</p>
                    <p className="mt-1 text-sm">{note.body}</p>
                    <time className="mt-1 text-xs uppercase tracking-wide" dateTime={note.createdAt}>
                      {formatRelative(note.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <aside className="space-y-4">
          <ArrearsCard arrears={tenant.arrearsCard} />
          <EventsWidget events={tenant.upcomingEvents} />
          <GuidedActions actions={tenant.guidedActions} />
        </aside>
      </section>
    </div>
  );
}

function CommsTab({ tenant }: { tenant: TenantWorkspace }) {
  const messages = useMemo(
    () => tenant.timeline.filter((event) => event.type === 'MESSAGE'),
    [tenant.timeline]
  );
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <p className="rounded-3xl border border-border/60 bg-surface/70 p-6 text-sm text-muted-foreground">
          No communications logged for this tenant yet.
        </p>
      ) : (
        messages.map((event) => (
          <article key={event.id} className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{event.summary}</span>
              <time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString()}</time>
            </div>
            {event.description ? <p className="mt-2 text-sm text-muted-foreground">{event.description}</p> : null}
          </article>
        ))
      )}
    </div>
  );
}

function TasksTab({ tenant }: { tenant: TenantWorkspace }) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
          <span className="text-xs text-muted-foreground">{tenant.tasks.length} total</span>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {tenant.tasks.length === 0 ? <li>No tasks logged.</li> : null}
          {tenant.tasks.map((task) => (
            <li key={task.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{task.title}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{task.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {task.dueAt ? <span>Due {formatRelative(task.dueAt)}</span> : null}
                {task.assignee ? <span>Owner · {task.assignee}</span> : null}
                {task.priority ? <span className="font-medium text-foreground">Priority {task.priority}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Notes</h3>
        {tenant.notes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No notes captured.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {tenant.notes.map((note) => (
              <li key={note.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{note.author}</span>
                  <time dateTime={note.createdAt}>{formatRelative(note.createdAt)}</time>
                </div>
                <p className="mt-1 text-sm">{note.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PaymentsTab({ tenant }: { tenant: TenantWorkspace }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Ledger</h3>
        <span className="text-xs text-muted-foreground">{tenant.ledger.length} entries</span>
      </header>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Amount</th>
              <th className="pb-2">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tenant.ledger.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-sm text-muted-foreground">
                  No payments recorded.
                </td>
              </tr>
            ) : null}
            {tenant.ledger.map((entry) => (
              <tr key={entry.id} className="text-sm text-muted-foreground">
                <td className="py-2 pr-4 text-foreground">{formatDate(entry.date)}</td>
                <td className="py-2 pr-4 uppercase tracking-wide">{entry.type}</td>
                <td className="py-2 pr-4 font-medium text-foreground">{formatCurrency(entry.amountCents)}</td>
                <td className="py-2">{entry.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobsTab({ tenant }: { tenant: TenantWorkspace }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Maintenance jobs</h3>
        <span className="text-xs text-muted-foreground">{tenant.maintenance.length} total</span>
      </header>
      <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
        {tenant.maintenance.length === 0 ? <li>No jobs logged.</li> : null}
        {tenant.maintenance.map((job) => (
          <li key={job.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{job.title}</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{job.status}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {job.vendor?.name ? <span>Vendor · {job.vendor.name}</span> : null}
              {job.priority ? <span>Priority {job.priority}</span> : null}
              {job.costCents ? <span>{formatCurrency(job.costCents)}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilesTab({ tenant }: { tenant: TenantWorkspace }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Files & compliance</h3>
        <span className="text-xs text-muted-foreground">{tenant.files.length} files</span>
      </header>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {tenant.files.length === 0 ? <li className="text-sm text-muted-foreground">No files uploaded.</li> : null}
        {tenant.files.map((file) => (
          <li key={file.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="mt-1 text-xs">Uploaded {formatRelative(file.uploadedAt)}</p>
            <p className="mt-1 text-xs">Version {file.version}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineSection({ events }: { events: TimelineEventBase[] }) {
  return <TimelineFeed events={events} />;
}

function HealthBreakdown({
  breakdown,
}: {
  breakdown: { paymentTimeliness: number; responseLatency: number; openJobs: number; compliance: number };
}) {
  return (
    <div className="grid gap-3 rounded-3xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground md:grid-cols-2">
      <BreakdownRow label="Payment timeliness" value={`${breakdown.paymentTimeliness}%`} />
      <BreakdownRow label="Response latency" value={`${breakdown.responseLatency}%`} />
      <BreakdownRow label="Open jobs" value={String(breakdown.openJobs)} />
      <BreakdownRow label="Compliance" value={`${breakdown.compliance}%`} />
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface/70 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ArrearsCard({
  arrears,
}: {
  arrears: TenantWorkspace['arrearsCard'];
}) {
  if (!arrears) {
    return (
      <div className="rounded-3xl border border-border/60 bg-background/80 p-5 text-sm text-muted-foreground">
        <h3 className="text-sm font-semibold text-foreground">Arrears</h3>
        <p className="mt-2">No arrears recorded.</p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-destructive/50 bg-destructive/10 p-5 text-sm text-destructive">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-destructive">Arrears balance</h3>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(arrears.balanceCents)}</p>
          <p className="text-xs">{arrears.daysLate} days late</p>
        </div>
        {arrears.nextStep ? (
          <button
            type="button"
            className="rounded-lg border border-destructive bg-destructive px-3 py-1.5 text-xs font-semibold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/60"
            onClick={() => alert(`Trigger ${arrears.nextStep.label}`)}
          >
            {arrears.nextStep.label}
          </button>
        ) : null}
      </div>
      {arrears.lastPaymentAt ? (
        <p className="mt-2 text-xs text-destructive/90">Last payment {formatDate(arrears.lastPaymentAt)}</p>
      ) : null}
    </div>
  );
}

function EventsWidget({ events }: { events: TenantWorkspace['upcomingEvents'] }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 p-5 text-sm text-muted-foreground">
      <h3 className="text-sm font-semibold text-foreground">Upcoming events</h3>
      <ul className="mt-2 space-y-2">
        {events.length === 0 ? <li>No events scheduled.</li> : null}
        {events.map((event) => (
          <li key={event.id} className="rounded-2xl border border-border/60 bg-surface/70 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{event.label}</span>
              <time className="text-xs" dateTime={event.date}>
                {formatDate(event.date)}
              </time>
            </div>
            <p className="text-xs text-muted-foreground">{event.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: 'neutral' | 'amber' }) {
  const palette: Record<'neutral' | 'amber', string> = {
    neutral: 'bg-surface/80 text-muted-foreground border-border/60',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/60',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${palette[tone]}`}>
      {label.replace('_', ' ')}
    </span>
  );
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

