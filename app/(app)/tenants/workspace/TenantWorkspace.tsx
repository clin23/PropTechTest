'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useTenantList, useTenantWorkspace } from '../../../../lib/tenants/client';
import type { TenantSummary } from '../../../../lib/tenants/types';
import { BulkToolbar } from './BulkToolbar';
import { FiltersPanel } from './FiltersPanel';
import { TenantDetailPanel } from './TenantDetailPanel';
import { TenantListPanel } from './TenantListPanel';
import { WorkspaceShell } from './WorkspaceShell';
import {
  WorkspaceProvider,
  buildTenantListParams,
  useWorkspaceDispatch,
  useWorkspaceState,
  type WorkspaceFilters,
} from './state';

export function TenantWorkspace() {
  return (
    <WorkspaceProvider>
      <TenantWorkspaceInner />
    </WorkspaceProvider>
  );
}

function TenantWorkspaceInner() {
  const filters = useWorkspaceState((state) => state.filters);
  const selection = useWorkspaceState((state) => state.selection);
  const selectedTenantId = useWorkspaceState((state) => state.selectedTenantId);
  const dispatch = useWorkspaceDispatch();
  const router = useRouter();

  const params = useMemo(() => buildTenantListParams(filters), [filters]);
  const tenantsQuery = useTenantList(params);
  const tenants = tenantsQuery.data ?? [];

  const filteredTenants = useMemo(() => applyWorkspaceFilters(tenants, filters), [tenants, filters]);

  useEffect(() => {
    if (!filteredTenants.some((tenant) => tenant.id === selectedTenantId)) {
      const nextId = filteredTenants[0]?.id;
      dispatch({ type: 'set-selected-tenant', tenantId: nextId });
    }
  }, [dispatch, filteredTenants, selectedTenantId]);

  useEffect(() => {
    const nextSelection = selection.filter((id) => filteredTenants.some((tenant) => tenant.id === id));
    if (nextSelection.length !== selection.length) {
      dispatch({ type: 'set-selection', ids: nextSelection });
    }
  }, [dispatch, filteredTenants, selection]);

  const workspaceQuery = useTenantWorkspace(selectedTenantId);

  const handleSelect = (tenant: TenantSummary) => {
    dispatch({ type: 'set-selected-tenant', tenantId: tenant.id });
  };

  const handleOpen = (tenant: TenantSummary) => {
    dispatch({ type: 'set-selected-tenant', tenantId: tenant.id });
    router.push(`/tenants/${tenant.id}`);
  };

  useKeyboardShortcuts(filteredTenants, selectedTenantId, selection, dispatch, router);

  return (
    <WorkspaceShell
      header={<WorkspaceHeader total={filteredTenants.length} selectionCount={selection.length} />}
      filters={<FiltersPanel />}
      list={
        <TenantListPanel
          tenants={filteredTenants}
          isLoading={tenantsQuery.isLoading}
          selectedTenantId={selectedTenantId}
          onSelect={handleSelect}
          onOpen={handleOpen}
        />
      }
      detail={<TenantDetailPanel tenant={workspaceQuery.data} isLoading={workspaceQuery.isLoading} />}
      bulkToolbar={<BulkToolbar tenantCount={filteredTenants.length} />}
    />
  );
}

function WorkspaceHeader({ total, selectionCount }: { total: number; selectionCount: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tenant workspace</h1>
        <p className="text-sm text-muted-foreground">
          Segment tenants, preview arrears, triage communications, and kick off guided workflows.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full bg-surface px-3 py-1 font-medium text-foreground">{total} tenants</span>
        {selectionCount ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{selectionCount} selected</span>
        ) : null}
        <span className="rounded-full bg-surface px-3 py-1">Press / to search · ↑↓ navigate · Space to multi-select</span>
      </div>
    </div>
  );
}

function useKeyboardShortcuts(
  tenants: TenantSummary[],
  selectedId: string | undefined,
  selection: string[],
  dispatch: ReturnType<typeof useWorkspaceDispatch>,
  router: ReturnType<typeof useRouter>
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === 'k') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('tenant-command-palette'));
        }
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (target?.getAttribute('role') === 'textbox') return;

      if (event.key === '/' || event.key === 'f') {
        event.preventDefault();
        document.getElementById('tenant-search-input')?.focus();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (tenants.length === 0) return;
        const index = selectedId ? tenants.findIndex((tenant) => tenant.id === selectedId) : -1;
        const next = index === tenants.length - 1 ? tenants[0] : tenants[(index + 1 + tenants.length) % tenants.length];
        dispatch({ type: 'set-selected-tenant', tenantId: next.id });
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (tenants.length === 0) return;
        const index = selectedId ? tenants.findIndex((tenant) => tenant.id === selectedId) : 0;
        const next = index <= 0 ? tenants[tenants.length - 1] : tenants[index - 1];
        dispatch({ type: 'set-selected-tenant', tenantId: next.id });
        return;
      }
      if (event.key === ' ') {
        if (!selectedId) return;
        event.preventDefault();
        dispatch({ type: 'toggle-select', id: selectedId });
        return;
      }
      if (event.key === 'Escape' && selection.length) {
        event.preventDefault();
        dispatch({ type: 'clear-selection' });
        return;
      }
      if (event.key === 'Enter' && selectedId) {
        event.preventDefault();
        router.push(`/tenants/${selectedId}`);
        return;
      }
      if (event.key.toLowerCase() === 'n') {
        window.dispatchEvent(new CustomEvent('tenant-action', { detail: { action: 'note', tenantId: selectedId } }));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, router, selectedId, selection, tenants]);
}

function applyWorkspaceFilters(tenants: TenantSummary[], filters: WorkspaceFilters) {
  return tenants.filter((tenant) => {
    if (filters.stages.length) {
      if (!tenant.stage || !filters.stages.includes(tenant.stage)) {
        return false;
      }
    }
    if (filters.watchlistOnly && !tenant.watchlist) {
      return false;
    }
    if (filters.showArrearsOnly && !tenant.arrears) {
      return false;
    }
    if (filters.tags.length && !filters.tags.every((tag) => tenant.tags.includes(tag))) {
      return false;
    }
    if (filters.customTags.length && !filters.customTags.every((tag) => tenant.tags.includes(tag as any))) {
      return false;
    }
    if (tenant.healthScore != null) {
      if (tenant.healthScore < filters.healthRange[0] || tenant.healthScore > filters.healthRange[1]) {
        return false;
      }
    }
    if (filters.arrearsTiers.length) {
      if (!tenant.arrears) {
        return false;
      }
      const tier = computeArrearsTier(tenant.arrears.daysLate);
      if (!tier || !filters.arrearsTiers.includes(tier)) {
        return false;
      }
    }
    if (filters.lastContactWithinDays != null) {
      if (!tenant.lastTouchpointAt) return false;
      const diff = Date.now() - new Date(tenant.lastTouchpointAt).getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      if (days > filters.lastContactWithinDays) return false;
    }
    return true;
  });
}

function computeArrearsTier(daysLate: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null {
  if (daysLate >= 28) return 'CRITICAL';
  if (daysLate >= 21) return 'HIGH';
  if (daysLate >= 14) return 'MEDIUM';
  if (daysLate >= 7) return 'LOW';
  return null;
}

