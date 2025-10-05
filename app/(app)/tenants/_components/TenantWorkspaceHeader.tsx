'use client';

import type { TenantWorkspace } from '../../../../lib/tenants/types';
import { HealthScoreBadge } from './HealthScoreBadge';
import { QuickActionsBar } from './QuickActionsBar';

interface TenantWorkspaceHeaderProps {
  tenant: TenantWorkspace;
}

export function TenantWorkspaceHeader({ tenant }: TenantWorkspaceHeaderProps) {
  const summary = tenant.summary;
  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {summary.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{summary.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[summary.email, summary.phone].filter(Boolean).join(' · ') || 'No contact details'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {summary.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase">
                  {tag.replace('-', ' ')}
                </span>
              ))}
              <HealthScoreBadge score={summary.healthScore} />
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Current tenancy:</span>
            <span className="ml-2">
              {summary.currentTenancy
                ? `${summary.currentTenancy.propertyLabel} · ${formatCurrency(summary.currentTenancy.rentCents)}/${summary.currentTenancy.frequency.toLowerCase()}`
                : 'None'}
            </span>
          </div>
          {summary.lastTouchpointAt ? (
            <div>
              <span className="font-medium text-foreground">Last touchpoint:</span>
              <span className="ml-2">{new Date(summary.lastTouchpointAt).toLocaleString()}</span>
            </div>
          ) : null}
        </div>
      </div>

      <QuickActionsBar tenantId={summary.id} tenantName={summary.name} />
    </div>
  );
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amountCents / 100);
}
