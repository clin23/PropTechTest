'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  useTenantList,
  useTenantWorkspace,
  type TenantListParams,
} from '../../../lib/tenants/client';
import type { TenantSummary, TenantTag } from '../../../lib/tenants/types';
import { TenantSearchBar } from './_components/TenantSearchBar';
import { TenantListVirtual } from './_components/TenantListVirtual';
import { TenantPreviewPanel } from './_components/TenantPreviewPanel';

const DEBOUNCE_MS = 250;

export default function TenantsOverviewPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tags, setTags] = useState<TenantTag[]>([]);
  const [arrearsOnly, setArrearsOnly] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>();
  const [lastGoKey, setLastGoKey] = useState<number>(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  const listParams: TenantListParams = useMemo(
    () => ({ q: debouncedSearch, tags, arrearsOnly }),
    [debouncedSearch, tags, arrearsOnly]
  );

  const tenantsQuery = useTenantList(listParams);
  const tenants = tenantsQuery.data ?? [];

  useEffect(() => {
    if (tenants.length === 0) {
      setSelectedTenantId(undefined);
      return;
    }
    if (!selectedTenantId || !tenants.some((tenant) => tenant.id === selectedTenantId)) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  const previewQuery = useTenantWorkspace(selectedTenantId);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === 'f') {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'n') {
        event.preventDefault();
        alert('Shortcut: new note (open from quick actions).');
      } else if (event.key === 't') {
        event.preventDefault();
        alert('Shortcut: new task.');
      } else if (event.key === 'm') {
        event.preventDefault();
        alert('Shortcut: new maintenance job.');
      } else if (event.key === 'g') {
        setLastGoKey(Date.now());
      } else if (event.key === 'o' && Date.now() - lastGoKey < 800) {
        event.preventDefault();
        router.push('/tenants');
      } else if (event.key === 'p' && Date.now() - lastGoKey < 800) {
        event.preventDefault();
        router.push('/properties');
      } else if (event.key === '[') {
        event.preventDefault();
        cycleTenant(tenants, selectedTenantId, -1, setSelectedTenantId);
      } else if (event.key === ']') {
        event.preventDefault();
        cycleTenant(tenants, selectedTenantId, 1, setSelectedTenantId);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [lastGoKey, router, tenants, selectedTenantId]);

  const handleSelect = (tenant: TenantSummary) => {
    setSelectedTenantId(tenant.id);
  };

  const handleOpen = (tenant: TenantSummary) => {
    router.push(`/tenants/${tenant.id}`);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-surface/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-8 py-6">
          <h1 className="text-2xl font-semibold">Tenant workspace</h1>
          <p className="text-sm text-muted-foreground">
            Segment tenants, preview arrears, and jump straight into guided actions.
          </p>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-6">
        <div className="w-[22rem] shrink-0 space-y-4" ref={(node) => (searchInputRef.current = node?.querySelector('input') ?? null)}>
          <TenantSearchBar
            value={search}
            onValueChange={setSearch}
            selectedTags={tags}
            onTagsChange={setTags}
            arrearsOnly={arrearsOnly}
            onArrearsChange={setArrearsOnly}
          />
        </div>
        <div className="flex min-w-0 flex-1 gap-6">
          <div className="w-[28rem] shrink-0">
            <TenantListVirtual
              tenants={tenants}
              isLoading={tenantsQuery.isLoading}
              selectedId={selectedTenantId}
              onSelect={handleSelect}
              onOpen={handleOpen}
            />
          </div>
          <div className="flex-1">
            <TenantPreviewPanel tenant={previewQuery.data} isLoading={previewQuery.isLoading} />
          </div>
        </div>
      </section>
    </main>
  );
}

function cycleTenant(
  tenants: TenantSummary[],
  currentId: string | undefined,
  direction: 1 | -1,
  setSelected: (id: string) => void
) {
  if (tenants.length === 0) return;
  const index = currentId ? tenants.findIndex((tenant) => tenant.id === currentId) : -1;
  const nextIndex = index === -1 ? 0 : (index + direction + tenants.length) % tenants.length;
  setSelected(tenants[nextIndex].id);
}
