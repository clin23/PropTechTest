'use client';

import type { TenantWorkspace } from '../../../../lib/tenants/types';
import { HealthScoreBadge } from './HealthScoreBadge';
import { QuickActionsBar } from './QuickActionsBar';

interface TenantPreviewPanelProps {
  tenant?: TenantWorkspace;
  isLoading?: boolean;
}

export function TenantPreviewPanel({ tenant, isLoading }: TenantPreviewPanelProps) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-surface/60 p-6">
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-surface/60 p-8 text-center text-sm text-muted-foreground">
        <p className="text-base font-semibold text-foreground">Select a tenant to preview</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Hover or tap a tenant from the directory to see their summary, arrears, and quick actions here.
        </p>
      </div>
    );
  }

  const { summary, arrearsCard, guidedActions, upcomingEvents } = tenant;

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {summary.avatarInitials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{summary.name}</h2>
            <p className="text-sm text-muted-foreground">
              {[summary.email, summary.phone].filter(Boolean).join(' · ') || 'No contact details'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {summary.currentTenancy ? (
                <span>Tenancy: {summary.currentTenancy.propertyLabel}</span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase">Prospect</span>
              )}
              <HealthScoreBadge score={summary.healthScore} />
            </div>
          </div>
        </div>
      </header>

      <QuickActionsBar tenantId={summary.id} tenantName={summary.name} />

      {arrearsCard ? (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-destructive/80">Arrears balance</p>
              <p className="text-lg font-semibold text-destructive">{formatCurrency(arrearsCard.balanceCents)}</p>
              <p className="text-xs text-destructive/90">{arrearsCard.daysLate} days late</p>
            </div>
            {arrearsCard.nextStep ? (
              <button
                type="button"
                className="rounded-xl border border-destructive bg-destructive px-3 py-1.5 text-xs font-semibold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/60"
                onClick={() => alert(`Triggering ${arrearsCard.nextStep.label}`)}
              >
                {arrearsCard.nextStep.label}
              </button>
            ) : null}
          </div>
          {arrearsCard.lastPaymentAt ? (
            <p className="mt-2 text-xs text-destructive/80">
              Last payment {new Date(arrearsCard.lastPaymentAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
          <h3 className="text-sm font-semibold text-foreground">Upcoming events</h3>
          <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
            {upcomingEvents.length === 0 ? <li>No events scheduled.</li> : null}
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-surface/70 px-3 py-2">
                <span className="font-medium text-foreground">{event.label}</span>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
          <h3 className="text-sm font-semibold text-foreground">Guided actions</h3>
          <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
            {guidedActions.map((action) => (
              <li key={action.id} className="rounded-xl border border-border/40 bg-surface/60 p-3">
                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-border/60 px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
                  onClick={() => alert(action.cta)}
                >
                  {action.cta}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amountCents / 100);
}
