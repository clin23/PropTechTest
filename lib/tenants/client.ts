import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  LedgerEntry,
  TenantNote,
  TenantSummary,
  TenantTask,
  TenantWorkspace,
  TimelineEventBase,
  TenantTag,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const headers = new Headers(init?.headers);
  if (!isFormData && init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${API_BASE}${input}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export interface TenantListParams {
  q?: string;
  tags?: TenantTag[];
  arrearsOnly?: boolean;
}

export function useTenantList(params: TenantListParams) {
  return useQuery({
    queryKey: ['tenant-list', params],
    queryFn: () => fetchTenantSummaries(params),
  });
}

export function useTenantWorkspace(tenantId?: string) {
  return useQuery({
    enabled: Boolean(tenantId),
    queryKey: ['tenant-workspace', tenantId],
    queryFn: () => fetchTenantWorkspace(tenantId as string),
  });
}

export function useTimeline(tenantId?: string) {
  return useQuery({
    enabled: Boolean(tenantId),
    queryKey: ['tenant-timeline', tenantId],
    queryFn: () => fetchTimeline(tenantId as string),
  });
}

export function useNotes(tenantId?: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: { tenantId: string; body: string; tags: string[]; author: string }) =>
      createNote(input.tenantId, input),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-workspace', note.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-timeline', note.tenantId] });
    },
  });
  return {
    mutation,
    data: useQuery({
      enabled: Boolean(tenantId),
      queryKey: ['tenant-notes', tenantId],
      queryFn: () => fetchNotes(tenantId as string),
    }).data,
  } as const;
}

export async function fetchTenantSummaries(params: TenantListParams): Promise<TenantSummary[]> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.tags?.length) search.set('tags', params.tags.join(','));
  if (params.arrearsOnly) search.set('arrearsOnly', 'true');
  const data = await apiFetch<{ items: TenantSummary[] }>(`/api/tenants?${search.toString()}`);
  return data.items;
}

export async function fetchTenantWorkspace(tenantId: string): Promise<TenantWorkspace> {
  return apiFetch<TenantWorkspace>(`/api/tenants/${tenantId}`);
}

export async function fetchTimeline(tenantId: string): Promise<TimelineEventBase[]> {
  const data = await apiFetch<{ items: TimelineEventBase[] }>(`/api/tenants/${tenantId}/timeline`);
  return data.items;
}

export async function fetchNotes(tenantId: string): Promise<TenantNote[]> {
  const data = await apiFetch<{ items: TenantNote[] }>(`/api/tenants/${tenantId}/notes`);
  return data.items;
}

export async function createNote(
  tenantId: string,
  input: { body: string; tags: string[]; author: string }
): Promise<TenantNote> {
  return apiFetch<TenantNote>(`/api/tenants/${tenantId}/notes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createTask(
  tenantId: string,
  input: { title: string; dueAt?: string }
): Promise<TenantTask> {
  return apiFetch<TenantTask>(`/api/tenants/${tenantId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function addLedgerEntry(
  tenantId: string,
  input: { type: LedgerEntry['type']; amountCents: number; note?: string }
): Promise<LedgerEntry> {
  return apiFetch<LedgerEntry>(`/api/tenants/${tenantId}/ledger`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function addMaintenance(
  tenantId: string,
  input: { title: string; vendorName?: string }
): Promise<any> {
  return apiFetch(`/api/tenants/${tenantId}/maintenance`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function logCommunication(
  tenantId: string,
  input: { channel: 'CALL' | 'EMAIL' | 'SMS'; summary: string; body?: string }
): Promise<TimelineEventBase> {
  return apiFetch(`/api/tenants/${tenantId}/comms`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function triggerRentReview(
  tenantId: string,
  input: { basis: 'CPI' | 'PERCENT'; amount: number; effectiveDate: string }
) {
  return apiFetch(`/api/tenants/${tenantId}/rent-review`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function uploadTenantFile(tenantId: string, file: File) {
  const body = new FormData();
  body.set('tenantId', tenantId);
  body.set('file', file);
  return apiFetch(`/api/files`, {
    method: 'POST',
    body,
  });
}

export async function fetchSavedFilters(userId: string) {
  const params = new URLSearchParams({ userId });
  const data = await apiFetch<{ items: Array<{ id: string; name: string; query: TenantListParams }> }>(
    `/api/tenants?${params.toString()}`,
    { method: 'PUT' }
  );
  return data.items;
}

export async function saveFilterPreset(userId: string, name: string, query: TenantListParams) {
  return apiFetch(`/api/tenants`, {
    method: 'POST',
    body: JSON.stringify({ userId, name, query }),
  });
}
