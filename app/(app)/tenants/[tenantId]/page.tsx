'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useTenantWorkspace } from '../../../../lib/tenants/client';
import { GuidedActions } from '../_components/GuidedActions';
import { LedgerTable } from '../_components/LedgerTable';
import { TenantWorkspaceHeader } from '../_components/TenantWorkspaceHeader';
import { TimelineFeed } from '../_components/TimelineFeed';
import { UploadDropzone } from '../_components/UploadDropzone';

const TABS = [
  'summary',
  'timeline',
  'notes',
  'tenancies',
  'ledger',
  'inspections',
  'tasks',
  'maintenance',
  'files',
  'preferences',
] as const;

type TabKey = (typeof TABS)[number];

type TenantData = NonNullable<ReturnType<typeof useTenantWorkspace>['data']>;

export default function TenantWorkspacePage({ params }: { params: { tenantId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = TABS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'summary';

  const tenantQuery = useTenantWorkspace(params.tenantId);

  const handleTabChange = (tab: TabKey) => {
    const next = new URLSearchParams(Array.from(searchParams.entries()));
    next.set('tab', tab);
    router.replace(`/tenants/${params.tenantId}?${next.toString()}`);
  };

  if (tenantQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col gap-6 px-6 py-6">
        <div className="h-32 animate-pulse rounded-3xl bg-muted/40" />
        <div className="h-64 animate-pulse rounded-3xl bg-muted/30" />
      </main>
    );
  }

  if (tenantQuery.isError || !tenantQuery.data) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
        <h1 className="text-xl font-semibold text-foreground">Unable to load tenant</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Something went wrong fetching this workspace. Please return to the overview and try again.
        </p>
      </main>
    );
  }

  const tenant = tenantQuery.data;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col gap-6 px-6 py-6">
      <TenantWorkspaceHeader tenant={tenant} />
      <nav className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-surface/80 p-2 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {activeTab === 'summary' ? <SummaryTab tenant={tenant} /> : null}
      {activeTab === 'timeline' ? <TimelineFeed events={tenant.timeline} /> : null}
      {activeTab === 'notes' ? <NotesTab tenant={tenant} /> : null}
      {activeTab === 'tenancies' ? <TenanciesTab tenant={tenant} /> : null}
      {activeTab === 'ledger' ? <LedgerTable tenantName={tenant.summary.name} entries={tenant.ledger} /> : null}
      {activeTab === 'inspections' ? <InspectionsTab tenant={tenant} /> : null}
      {activeTab === 'tasks' ? <TasksTab tenant={tenant} /> : null}
      {activeTab === 'maintenance' ? <MaintenanceTab tenant={tenant} /> : null}
      {activeTab === 'files' ? <FilesTab tenant={tenant} /> : null}
      {activeTab === 'preferences' ? <PreferencesTab tenant={tenant} /> : null}
    </main>
  );
}

function SummaryTab({ tenant }: { tenant: TenantData }) {
  const { arrearsCard, guidedActions, upcomingEvents } = tenant;
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-4">
        <h2 className="text-sm font-semibold text-foreground">Primary details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <Detail label="Email" value={tenant.summary.email ?? '—'} />
          <Detail label="Phone" value={tenant.summary.phone ?? '—'} />
          <Detail label="Address" value={tenant.summary.address ?? '—'} />
          <Detail
            label="Current tenancy"
            value={tenant.summary.currentTenancy ? tenant.summary.currentTenancy.propertyLabel : 'None'}
          />
        </dl>
      </div>
      <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-4">
        <h2 className="text-sm font-semibold text-foreground">Upcoming</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {upcomingEvents.length === 0 ? <li>No events scheduled.</li> : null}
          {upcomingEvents.map((event) => (
            <li key={event.id} className="rounded-xl border border-border/40 bg-background/80 px-3 py-2">
              <div className="text-xs uppercase text-muted-foreground">{event.type}</div>
              <div className="text-sm font-semibold text-foreground">{event.label}</div>
              <div className="text-xs text-muted-foreground">{new Date(event.date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
      {arrearsCard ? (
        <div className="rounded-3xl border border-destructive/60 bg-destructive/10 p-4 text-sm md:col-span-2">
          <h2 className="text-sm font-semibold text-destructive">Arrears</h2>
          <p className="text-lg font-semibold text-destructive">{formatCurrency(arrearsCard.balanceCents)}</p>
          <p className="text-xs text-destructive/90">{arrearsCard.daysLate} days late</p>
        </div>
      ) : null}
      <div className="md:col-span-2">
        <GuidedActions actions={guidedActions} />
      </div>
    </section>
  );
}

function NotesTab({ tenant }: { tenant: TenantData }) {
  return (
    <section className="space-y-3">
      {tenant.notes.map((note) => (
        <article key={note.id} className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{note.author}</span>
            <time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleString()}</time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
          {note.tags.length ? (
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase text-muted-foreground">
              {note.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function TenanciesTab({ tenant }: { tenant: TenantData }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {tenant.tenancies.map((tenancy) => (
        <div key={tenancy.id} className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
          <h3 className="text-sm font-semibold text-foreground">{tenancy.propertyLabel}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(tenancy.startDate).toLocaleDateString()} →{' '}
            {tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString() : 'Current'}
          </p>
          <p className="mt-2 text-sm text-foreground">
            Rent {formatCurrency(tenancy.rentCents)} / {tenancy.frequency.toLowerCase()}
          </p>
        </div>
      ))}
    </section>
  );
}

function InspectionsTab({ tenant }: { tenant: TenantData }) {
  return (
    <section className="space-y-3">
      {tenant.inspections.map((inspection) => (
        <div key={inspection.id} className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{inspection.type}</span>
            <span>{new Date(inspection.scheduledFor).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">Status: {inspection.status}</p>
          {inspection.findings ? <p className="mt-2 text-xs text-muted-foreground">{inspection.findings}</p> : null}
        </div>
      ))}
    </section>
  );
}

function TasksTab({ tenant }: { tenant: TenantData }) {
  const grouped = useMemo(() => {
    return tenant.tasks.reduce<Record<string, typeof tenant.tasks>>((acc, task) => {
      const key = task.status;
      acc[key] = acc[key] ? [...acc[key], task] : [task];
      return acc;
    }, {});
  }, [tenant.tasks]);

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {['TODO', 'IN_PROGRESS', 'WAITING', 'DONE'].map((column) => (
        <div key={column} className="rounded-2xl border border-border/60 bg-surface/60 p-3">
          <h3 className="text-sm font-semibold text-foreground">{column.replace('_', ' ')}</h3>
          <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
            {(grouped[column] ?? []).map((task) => (
              <li key={task.id} className="rounded-xl border border-border/40 bg-background/80 p-2">
                <p className="font-medium text-foreground">{task.title}</p>
                {task.dueAt ? <p className="text-xs text-muted-foreground">Due {new Date(task.dueAt).toLocaleDateString()}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function MaintenanceTab({ tenant }: { tenant: TenantData }) {
  return (
    <section className="space-y-3">
      {tenant.maintenance.map((job) => (
        <article key={job.id} className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{job.status}</span>
            <time dateTime={job.createdAt}>{new Date(job.createdAt).toLocaleDateString()}</time>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">{job.title}</p>
          {job.vendor ? <p className="text-xs text-muted-foreground">Vendor: {job.vendor.name}</p> : null}
        </article>
      ))}
    </section>
  );
}

function FilesTab({ tenant }: { tenant: TenantData }) {
  return (
    <section className="space-y-4">
      <UploadDropzone tenantId={tenant.summary.id} />
      <div className="grid gap-3 md:grid-cols-2">
        {tenant.files.map((file) => (
          <div key={file.id} className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
            <p className="text-sm font-semibold text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date(file.uploadedAt).toLocaleDateString()} · v{file.version}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreferencesTab({ tenant }: { tenant: TenantData }) {
  const prefs = tenant.preferences;
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <h3 className="text-sm font-semibold text-foreground">Notification channels</h3>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          <li>Email: {prefs.notificationChannels.email ? 'Enabled' : 'Disabled'}</li>
          <li>SMS: {prefs.notificationChannels.sms ? 'Enabled' : 'Disabled'}</li>
          <li>Phone: {prefs.notificationChannels.phone ? 'Enabled' : 'Disabled'}</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <h3 className="text-sm font-semibold text-foreground">Cadence & Consent</h3>
        <p className="text-sm text-muted-foreground">Cadence: {prefs.communicationCadence}</p>
        <p className="text-sm text-muted-foreground">
          Preferred payment day: {prefs.preferredPaymentDay ? `Day ${prefs.preferredPaymentDay}` : 'Not set'}
        </p>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amountCents / 100);
}
