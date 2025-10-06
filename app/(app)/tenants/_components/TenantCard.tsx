'use client';

import { useMemo } from 'react';

import type { TenantSummary, TenantTag } from '../../../../lib/tenants/types';

interface TenantCardProps {
  tenant: TenantSummary;
  selected?: boolean;
  onSelect?: (tenant: TenantSummary) => void;
  onOpen?: (tenant: TenantSummary) => void;
}

export function TenantCard({ tenant, selected, onSelect, onOpen }: TenantCardProps) {
  const initials = useMemo(() => {
    return tenant.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [tenant.name]);

  const handleClick = () => {
    onSelect?.(tenant);
  };

  const handleDoubleClick = () => {
    onOpen?.(tenant);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group flex w-full items-start gap-3 rounded-2xl border border-border/60 px-4 py-3 text-left transition ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'bg-surface/60 hover:border-primary/60 hover:bg-surface'
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{tenant.name}</p>
          {tenant.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {tenant.arrears ? (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
              {formatCurrency(tenant.arrears.amountCents)} · {tenant.arrears.daysLate}d
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {[tenant.email, tenant.phone].filter(Boolean).join(' · ') || 'No contact details'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {tenant.currentTenancy ? (
            <span>{tenant.currentTenancy.propertyLabel}</span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide">No tenancy</span>
          )}
          {tenant.lastTouchpointAt ? (
            <span aria-label="Last touchpoint" className="flex items-center gap-1">
              <Dot />
              {timeAgo(tenant.lastTouchpointAt)}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function TenantCardSkeleton() {
  return (
    <div className="flex w-full items-start gap-3 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-muted/80" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
      </div>
    </div>
  );
}

function TagBadge({ tag }: { tag: TenantTag }) {
  const label: Record<TenantTag, string> = {
    'A-GRADE': 'A-grade',
    WATCHLIST: 'Watchlist',
    PROSPECT: 'Prospect',
    ARREARS: 'Arrears',
    INSPECTION_SOON: 'Inspection <30d',
    VACATING: 'Vacating',
    NEW: 'New',
  };
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label[tag]}
    </span>
  );
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

function formatCurrency(amountCents: number) {
  const formatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  });
  return formatter.format(amountCents / 100);
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />;
}
