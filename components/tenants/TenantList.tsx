'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { TenantListFilters, TenantListItem } from '../../lib/api/tenants';

type TenantListPanelProps = {
  tenants: TenantListItem[];
  selectedTenantId?: string;
  onSelect: (tenant?: TenantListItem) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  filters: TenantListFilters;
  onFiltersChange: (filters: TenantListFilters) => void;
};

const STATUS_LABELS: Record<TenantListItem['status'], string> = {
  A_GRADE: 'A-Grade',
  WATCHLIST: 'Watchlist',
  PROSPECT: 'Prospect',
};

export function TenantListPanel({
  tenants,
  selectedTenantId,
  onSelect,
  isLoading,
  isError,
  onRetry,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: TenantListPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTenants = useMemo(
    () => tenants.filter((tenant) => tenant.currentPropertyId),
    [tenants]
  );
  const archivedTenants = useMemo(
    () => tenants.filter((tenant) => !tenant.currentPropertyId),
    [tenants]
  );
  const orderedTenants = useMemo(
    () => [...activeTenants, ...archivedTenants],
    [activeTenants, archivedTenants]
  );

  useEffect(() => {
    if (!orderedTenants.length) {
      setActiveIndex(0);
      return;
    }
    const index = selectedTenantId
      ? orderedTenants.findIndex((item) => item.id === selectedTenantId)
      : 0;
    setActiveIndex(index === -1 ? 0 : index);
  }, [orderedTenants, selectedTenantId]);

  const ensureVisible = useCallback((tenantId: string) => {
    const option = document.getElementById(`tenant-option-${tenantId}`);
    option?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === 'k') {
          event.preventDefault();
          const searchInput = listRef.current?.querySelector<HTMLInputElement>('input[data-tenant-search="true"]');
          searchInput?.focus();
        }
        return;
      }
      if (!orderedTenants.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.min(prev + 1, orderedTenants.length - 1);
          const tenant = orderedTenants[next];
          if (tenant) {
            onSelect(tenant);
            ensureVisible(tenant.id);
          }
          return next;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          const tenant = orderedTenants[next];
          if (tenant) {
            onSelect(tenant);
            ensureVisible(tenant.id);
          }
          return next;
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const tenant = orderedTenants[activeIndex];
        if (tenant) {
          onSelect(tenant);
          ensureVisible(tenant.id);
        }
      } else if (event.key.length === 1 && !event.altKey) {
        const searchInput = listRef.current?.querySelector<HTMLInputElement>('input[data-tenant-search="true"]');
        if (document.activeElement !== searchInput) {
          searchInput?.focus();
          searchInput?.select();
        }
      }
    };

    const node = listRef.current;
    node?.addEventListener('keydown', handleKeyDown);
    return () => node?.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, ensureVisible, onSelect, orderedTenants]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const scrollElement = scrollRef.current;
    if (!scrollElement.contains(document.activeElement)) {
      scrollElement.focus();
    }
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      ensureVisible(selectedTenantId);
    }
  }, [ensureVisible, selectedTenantId]);

  const statusFilters = useMemo(
    () =>
      (['A_GRADE', 'WATCHLIST', 'PROSPECT'] as Array<TenantListItem['status']>).map((status) => ({
        value: status,
        active: filters.statuses.includes(status),
        label: STATUS_LABELS[status],
      })),
    [filters.statuses]
  );

  const toggleStatus = (status: TenantListItem['status']) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: next });
  };

  return (
    <section ref={listRef} className="flex h-full flex-col" aria-label="Tenant list">
      <div className="flex items-center gap-2 border-b border-border/60 bg-surface/80 px-4 py-3">
        <div className="relative flex-1">
          <input
            data-tenant-search="true"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tenants by name, email, or phone"
            className="w-full rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/70"
            aria-label="Search tenants"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border/70 px-1 text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-border/50 px-4 py-3 text-xs font-medium text-muted-foreground">
        {statusFilters.map((status) => (
          <FilterChip key={status.value} active={status.active} onClick={() => toggleStatus(status.value)}>
            {status.label}
          </FilterChip>
        ))}
        <FilterChip active={filters.arrearsOnly} onClick={() => onFiltersChange({ ...filters, arrearsOnly: !filters.arrearsOnly })}>
          Arrears
        </FilterChip>
        <FilterChip
          active={Boolean(filters.nextInspectionInDays)}
          onClick={() =>
            onFiltersChange({
              ...filters,
              nextInspectionInDays: filters.nextInspectionInDays ? null : 30,
            })
          }
        >
          Next inspection &lt; 30d
        </FilterChip>
      </div>
      <div
        ref={scrollRef}
        role="listbox"
        tabIndex={0}
        aria-activedescendant={
          selectedTenantId ? `tenant-option-${selectedTenantId}` : undefined
        }
        className="relative flex-1 overflow-y-auto focus:outline-none"
      >
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm">
            <p className="font-medium text-foreground">Unable to load tenants</p>
            <p className="text-muted-foreground">Check your connection and try again.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-border/70 px-3 py-1 text-sm font-medium text-foreground transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Retry
            </button>
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No tenants match.</p>
            <p>Clear filters or add a tenant.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            <TenantSection
              label="Current tenants"
              tenants={activeTenants}
              selectedTenantId={selectedTenantId}
              onSelect={onSelect}
              emptyMessage="No tenants are currently linked to a property."
            />
            <TenantSection
              label="Archived tenants"
              tenants={archivedTenants}
              selectedTenantId={selectedTenantId}
              onSelect={onSelect}
              emptyMessage="No archived tenants."
            />
          </div>
        )}
      </div>
    </section>
  );
}

function TenantSection({
  label,
  tenants,
  selectedTenantId,
  onSelect,
  emptyMessage,
}: {
  label: string;
  tenants: TenantListItem[];
  selectedTenantId?: string;
  onSelect: (tenant: TenantListItem) => void;
  emptyMessage?: string;
}) {
  return (
    <div role="group" aria-label={label} className="px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {tenants.length ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/40 bg-surface/50">
          {tenants.map((tenant, index) => (
            <TenantListRow
              key={tenant.id}
              tenant={tenant}
              active={tenant.id === selectedTenantId}
              onClick={() => onSelect(tenant)}
              className={index === tenants.length - 1 ? 'border-b-0' : ''}
            />
          ))}
        </div>
      ) : emptyMessage ? (
        <p className="mt-2 text-xs text-muted-foreground">{emptyMessage}</p>
      ) : null}
    </div>
  );
}

function TenantListRow({
  tenant,
  active,
  onClick,
  className,
}: {
  tenant: TenantListItem;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      id={`tenant-option-${tenant.id}`}
      role="option"
      aria-selected={active}
      className={`group flex w-full items-center gap-3 border-b border-border/40 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active ? 'bg-primary/10' : 'hover:bg-surface/60'
      } ${className ?? ''}`}
    >
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {tenant.avatarUrl ? (
          <img src={tenant.avatarUrl} alt={tenant.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          tenant.name
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{tenant.name}</p>
          {tenant.hasOverdue ? <span className="mt-1 h-2 w-2 flex-none rounded-full bg-destructive" aria-hidden /> : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {tenant.email || tenant.phone || 'No contact details'}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass(tenant.status)}`}>
            {STATUS_LABELS[tenant.status]}
          </span>
          {!tenant.currentPropertyId ? (
            <span className="inline-flex items-center rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Archived
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function statusClass(status: TenantListItem['status']) {
  switch (status) {
    case 'A_GRADE':
      return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30';
    case 'WATCHLIST':
      return 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30';
    case 'PROSPECT':
    default:
      return 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30';
  }
}

function FilterChip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/60 bg-surface/80 text-muted-foreground hover:border-border'
      }`}
    >
      {children}
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 rounded-lg border border-border/40 bg-surface/60 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-2 w-1/3 rounded bg-muted/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

