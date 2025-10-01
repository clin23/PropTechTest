'use client';

import { useEffect, useMemo, useState } from 'react';

import { NotesTab } from './NotesTab';
import { PreferencesTab } from './PreferencesTab';
import { TimelineTab } from './TimelineTab';
import { FilesTab } from './FilesTab';
import { useTenant } from '../../lib/api/tenants';

const TABS = ['overview', 'notes', 'timeline', 'preferences', 'files'] as const;
type TabKey = (typeof TABS)[number];

interface TenantDetailPanelProps {
  tenantId?: string;
}

const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview',
  notes: 'Notes',
  timeline: 'Timeline',
  preferences: 'Preferences',
  files: 'Files',
};

export function TenantDetailPanel({ tenantId }: TenantDetailPanelProps) {
  const [activeTab, setActiveTab] = useStickyTab();
  const tenantQuery = useTenant(tenantId);

  useEffect(() => {
    if (tenantQuery.data && tenantId) {
      document.title = `${tenantQuery.data.name} • Tenant CRM`;
    }
  }, [tenantId, tenantQuery.data]);

  if (!tenantId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p className="text-lg font-semibold text-foreground">Select a tenant</p>
        <p className="max-w-sm text-sm">
          Choose a tenant from the list to view their details, notes, timeline, preferences, and files.
        </p>
      </div>
    );
  }

  if (tenantQuery.isLoading) {
    return <TenantDetailSkeleton />;
  }

  if (tenantQuery.isError || !tenantQuery.data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm">
        <p className="text-lg font-semibold text-foreground">Unable to load tenant</p>
        <p className="text-muted-foreground">Something went wrong fetching the tenant details.</p>
        <button
          type="button"
          onClick={() => tenantQuery.refetch()}
          className="rounded-md border border-border/70 px-3 py-1 text-sm font-medium text-foreground transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const tenant = tenantQuery.data;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/60 bg-surface px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{tenant.name}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {tenant.email || tenant.phone ? [tenant.email, tenant.phone].filter(Boolean).join(' • ') : 'No contact details'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Call', 'Email', 'SMS', 'New Note', 'New Task', 'Maintenance Job'].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-md border border-border/70 bg-surface px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex h-12 items-center justify-between border-b border-border/60 bg-surface px-4">
        <nav className="flex items-center gap-2" role="tablist" aria-label="Tenant detail tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto bg-surface">
        {activeTab === 'overview' ? <OverviewTab tenant={tenant} /> : null}
        {activeTab === 'notes' ? <NotesTab tenantId={tenant.id} tenantName={tenant.name} /> : null}
        {activeTab === 'timeline' ? <TimelineTab tenantId={tenant.id} /> : null}
        {activeTab === 'preferences' ? <PreferencesTab tenantId={tenant.id} /> : null}
        {activeTab === 'files' ? <FilesTab tenantId={tenant.id} /> : null}
      </div>
    </div>
  );
}

function useStickyTab(): [TabKey, (tab: TabKey) => void] {
  const [tab, setTab] = useState<TabKey>(() => {
    if (typeof window === 'undefined') return 'overview';
    const stored = window.localStorage.getItem('tenant-crm:last-tab') as TabKey | null;
    return stored && TABS.includes(stored) ? stored : 'overview';
  });

  const update = (next: TabKey) => {
    setTab(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tenant-crm:last-tab', next);
    }
  };

  return [tab, update];
}

function OverviewTab({ tenant }: { tenant: { name: string; email?: string; phone?: string; address?: string; lastInteractionAt?: string | undefined } }) {
  const lastInteraction = useMemo(() =>
    tenant.lastInteractionAt ? timeAgo(tenant.lastInteractionAt) : 'No recent activity',
  [tenant.lastInteractionAt]);

  return (
    <div className="space-y-6 px-6 py-6 text-sm text-foreground">
      <section className="grid gap-4 rounded-lg border border-border/60 bg-background/40 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Primary details</h3>
          <dl className="mt-2 grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide">Email</dt>
              <dd className="text-sm text-foreground">{tenant.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Phone</dt>
              <dd className="text-sm text-foreground">{tenant.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Address</dt>
              <dd className="text-sm text-foreground">{tenant.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Last touchpoint</dt>
              <dd className="text-sm text-foreground">{lastInteraction}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="rounded-lg border border-border/60 bg-background/40 p-4">
        <h3 className="text-sm font-semibold text-foreground">Guided actions</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Review arrears status and follow up on outstanding balances.</li>
          <li>Log upcoming inspections and set reminders with / commands.</li>
          <li>Upload lease agreements and inspection reports for quick access.</li>
        </ul>
      </section>
    </div>
  );
}

function timeAgo(value: string) {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diff = now - then;
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function TenantDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 bg-surface px-6 py-4">
        <div className="flex animate-pulse flex-col gap-3">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-3 w-64 rounded bg-muted/80" />
        </div>
      </div>
      <div className="border-b border-border/60 px-6 py-3">
        <div className="h-8 w-72 animate-pulse rounded bg-muted/60" />
      </div>
      <div className="flex-1 space-y-3 overflow-hidden p-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border border-border/50 bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

