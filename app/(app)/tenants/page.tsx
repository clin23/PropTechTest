'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { TenantDetailPanel } from '../../../components/tenants/TenantDetail';
import { TenantListPanel } from '../../../components/tenants/TenantList';
import type {
  TenantListFilters,
  TenantListItem,
  TenantListQuery,
} from '../../../lib/api/tenants';
import { useTenants } from '../../../lib/api/tenants';

export default function TenantDirectoryPage() {
  const [selectedTenant, setSelectedTenant] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TenantListFilters>({
    statuses: [],
    arrearsOnly: false,
    nextInspectionInDays: null,
  });
  const debouncedSearch = useDebouncedValue(search, 300);

  const query: TenantListQuery = useMemo(
    () => ({ search: debouncedSearch, filters }),
    [debouncedSearch, filters]
  );

  const tenantsQuery = useTenants(query);

  const handleSelect = useCallback((tenant: TenantListItem | undefined) => {
    setSelectedTenant(tenant?.id);
  }, []);

  useEffect(() => {
    if (!selectedTenant && tenantsQuery.data?.length) {
      setSelectedTenant(tenantsQuery.data[0].id);
    }
  }, [selectedTenant, tenantsQuery.data]);

  const { leftWidth, onDragStart } = useSplitPane(32);

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Tenant CRM</h1>
            <p className="text-sm text-muted-foreground">
              Manage tenants, communications, tasks, and files in a single workspace.
            </p>
          </div>
          <HelpTooltip />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full w-full overflow-hidden">
          <div
            className="h-full min-w-[18rem] max-w-[32rem] overflow-hidden border-r border-border/60 bg-surface/50"
            style={{ width: `${leftWidth}%` }}
          >
            <TenantListPanel
              tenants={tenantsQuery.data ?? []}
              isLoading={tenantsQuery.isLoading}
              isError={Boolean(tenantsQuery.error)}
              onRetry={() => tenantsQuery.refetch()}
              selectedTenantId={selectedTenant}
              onSelect={handleSelect}
              search={search}
              onSearchChange={setSearch}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          <div
            role="separator"
            tabIndex={0}
            onMouseDown={(event) => onDragStart(event.nativeEvent)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                onDragStart(undefined, -4);
              } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                onDragStart(undefined, 4);
              }
            }}
            aria-orientation="vertical"
            className="flex w-2 cursor-col-resize items-center justify-center bg-transparent outline-none"
          >
            <div className="h-16 w-[3px] rounded-full bg-border" />
          </div>
          <div className="flex-1 overflow-hidden bg-surface">
            <TenantDetailPanel tenantId={selectedTenant} />
          </div>
        </div>
      </main>
    </div>
  );
}

function HelpTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-surface/80 text-sm font-medium text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Tenant CRM help"
        onClick={() => setOpen((prev) => !prev)}
      >
        ?
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border/60 bg-surface/95 p-4 text-sm shadow-lg">
          <p className="font-semibold text-foreground">Need a hand?</p>
          <p className="mt-1 text-muted-foreground">
            Search tenants, use <kbd className="rounded border px-1">/</kbd> shortcuts in notes, and press
            <kbd className="ml-1 rounded border px-1">Ctrl</kbd>+<kbd className="rounded border px-1">K</kbd> to jump to search. Contact support if something feels off.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function useSplitPane(initialPercentage: number) {
  const [leftWidth, setLeftWidth] = useState(initialPercentage);

  const onDragStart = useCallback((event?: MouseEvent, deltaFromKey?: number) => {
    if (typeof deltaFromKey === 'number') {
      setLeftWidth((prev) => clamp(prev + deltaFromKey, 18, 60));
      return;
    }
    if (!event) return;
    const startX = event.clientX;
    const handleMove = (move: MouseEvent) => {
      const delta = move.clientX - startX;
      const percentage = (delta / window.innerWidth) * 100;
      setLeftWidth((prev) => clamp(prev + percentage, 18, 60));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, []);

  return { leftWidth, onDragStart };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
