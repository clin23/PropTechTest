'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { TenantSummary } from '../../../../lib/tenants/types';
import { useWorkspaceDispatch, useWorkspaceState } from './state';

const ROW_HEIGHT = 112;

interface TenantListPanelProps {
  tenants: TenantSummary[];
  isLoading: boolean;
  onSelect: (tenant: TenantSummary) => void;
  onOpen: (tenant: TenantSummary) => void;
  selectedTenantId?: string;
}

export function TenantListPanel({ tenants, isLoading, onSelect, onOpen, selectedTenantId }: TenantListPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState(480);
  const [scrollTop, setScrollTop] = useState(0);
  const selection = useWorkspaceState((state) => state.selection);
  const dispatch = useWorkspaceDispatch();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const handleScroll = () => setScrollTop(element.scrollTop);
    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          setViewportHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { startIndex, endIndex } = useMemo(() => {
    const total = tenants.length;
    if (total === 0) return { startIndex: 0, endIndex: 0 };
    const visible = Math.ceil(viewportHeight / ROW_HEIGHT);
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 6);
    const end = Math.min(total, start + visible + 12);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, viewportHeight, tenants.length]);

  const rendered = tenants.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;
  const totalHeight = tenants.length * ROW_HEIGHT;
  const selectionSet = useMemo(() => new Set(selection), [selection]);

  const toggleSelection = useCallback(
    (tenantId: string) => {
      dispatch({ type: 'toggle-select', id: tenantId });
    },
    [dispatch]
  );

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, tenant: TenantSummary) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onOpen(tenant);
    } else if (event.key === ' ') {
      event.preventDefault();
      toggleSelection(tenant.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-3" aria-label="Loading tenants">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
        <p className="text-base font-semibold text-foreground">No tenants match these filters</p>
        <p>Adjust filters or clear saved view to see more results.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto" role="list" aria-label="Tenant list">
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }} className="space-y-2 px-3 py-2">
          {rendered.map((tenant) => {
            const selected = tenant.id === selectedTenantId;
            const checked = selectionSet.has(tenant.id);
            return (
              <article
                key={tenant.id}
                tabIndex={0}
                role="listitem"
                aria-selected={selected}
                onClick={() => onSelect(tenant)}
                onDoubleClick={() => onOpen(tenant)}
                onKeyDown={(event) => handleCardKeyDown(event, tenant)}
                className={`group flex items-start gap-3 rounded-2xl border px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/60 bg-surface/80 hover:border-primary/50'
                }`}
              >
                <label className="mt-1 inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelection(tenant.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary"
                    aria-label={`Select ${tenant.name}`}
                  />
                </label>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {computeInitials(tenant.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{tenant.name}</span>
                    {tenant.stage ? <Badge label={tenant.stage} tone="neutral" /> : null}
                    {tenant.healthScore != null ? <HealthBadge score={tenant.healthScore} /> : null}
                    {tenant.watchlist ? <Badge label="Watchlist" tone="amber" /> : null}
                    {tenant.arrears ? (
                      <Badge
                        label={`${formatCurrency(tenant.arrears.amountCents)} · ${tenant.arrears.daysLate}d`}
                        tone="destructive"
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {[tenant.email, tenant.phone].filter(Boolean).join(' · ') || 'No contact details'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {tenant.currentTenancy ? (
                      <span className="inline-flex items-center gap-1">
                        <Dot />
                        {tenant.currentTenancy.propertyLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Dot />
                        No tenancy
                      </span>
                    )}
                    {tenant.updatedAgo ? (
                      <span className="inline-flex items-center gap-1" aria-label="Last updated">
                        <Dot />
                        {tenant.updatedAgo}
                      </span>
                    ) : null}
                    {tenant.indicators?.unreadComms ? (
                      <span className="inline-flex items-center gap-1 text-primary" aria-label="Unread communications">
                        <Dot />
                        {tenant.indicators.unreadComms} unread comms
                      </span>
                    ) : null}
                    {tenant.indicators?.openTasks ? (
                      <span className="inline-flex items-center gap-1 text-primary/80" aria-label="Open tasks">
                        <Dot />
                        {tenant.indicators.openTasks} open tasks
                      </span>
                    ) : null}
                    {tenant.indicators?.overdueCompliance ? (
                      <span className="inline-flex items-center gap-1 text-destructive" aria-label="Compliance overdue">
                        <Dot />
                        Compliance overdue
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-xs">
                  <div className="hidden gap-2 md:flex">
                    <QuickAction label="Email" onClick={() => onOpenWithAction(tenant, onOpen, 'email')} />
                    <QuickAction label="SMS" onClick={() => onOpenWithAction(tenant, onOpen, 'sms')} />
                    <QuickAction label="Call" onClick={() => onOpenWithAction(tenant, onOpen, 'call')} />
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSelection(tenant.id);
                    }}
                  >
                    {checked ? 'Selected' : 'Select'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function onOpenWithAction(tenant: TenantSummary, onOpen: (tenant: TenantSummary) => void, action: string) {
  onOpen(tenant);
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('tenant-action', { detail: { action, tenantId: tenant.id } }));
  }, 0);
}

function computeInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(
    value / 100
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />;
}

function Badge({ label, tone }: { label: string; tone: 'neutral' | 'destructive' | 'amber' }) {
  const palette: Record<'neutral' | 'destructive' | 'amber', string> = {
    neutral: 'border-border/60 bg-background text-muted-foreground',
    destructive: 'border-destructive/60 bg-destructive/10 text-destructive',
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-600',
  } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${palette[tone]}`}>
      {label.replace('_', ' ')}
    </span>
  );
}

function HealthBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/40' : score >= 40 ? 'text-amber-600 bg-amber-500/10 border-amber-500/40' : 'text-destructive bg-destructive/10 border-destructive/40';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}>Health {score}</span>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="rounded-lg border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-muted/20 px-3 py-3">
      <div className="h-4 w-4 rounded bg-muted" />
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-52 rounded bg-muted/80" />
        <div className="h-3 w-32 rounded bg-muted/60" />
      </div>
    </div>
  );
}

