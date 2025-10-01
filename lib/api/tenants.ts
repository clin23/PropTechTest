import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { api } from '../api';

export type TenantListItem = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'A_GRADE' | 'WATCHLIST' | 'PROSPECT';
  hasOverdue?: boolean;
  avatarUrl?: string | null;
};

export type TenantListFilters = {
  statuses: Array<TenantListItem['status']>;
  arrearsOnly: boolean;
  nextInspectionInDays?: number | null;
};

export type NoteInput = {
  tenantId: string;
  body: string;
  tags: Array<'general' | 'maintenance' | 'arrears' | 'inspection' | 'comms'>;
  followUpAt?: string | null;
};

export type Note = NoteInput & {
  id: string;
  createdAt: string;
  updatedAt?: string;
  author: string;
};

export type TimelineEvent =
  | { type: 'note'; id: string; at: string; tag?: string; snippet: string }
  | { type: 'payment'; id: string; at: string; amount: number; status: 'posted' | 'late' }
  | { type: 'job'; id: string; at: string; title: string; status: 'open' | 'scheduled' | 'closed' }
  | { type: 'message'; id: string; at: string; channel: 'email' | 'sms' | 'call'; direction: 'in' | 'out' }
  | { type: 'lease'; id: string; at: string; event: 'start' | 'renewal' | 'end' };

export type TenantDetail = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  statuses: Array<TenantListItem['status']>;
  address?: string;
  lastInteractionAt?: string;
  bestContactTime?: string | null;
};

export type TenantPreferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  bestContactTime?: string | null;
};

export type TenantFile = {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  uploadedAt: string;
  url?: string;
};

const globalEnv =
  (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) as
    | Record<string, string | undefined>
    | undefined;

const windowMock = typeof window !== 'undefined' ? (window as any).__MOCK_MODE__ : undefined;

const MOCK_MODE =
  windowMock === true ||
  globalEnv?.NEXT_PUBLIC_MOCK_MODE === 'true' ||
  globalEnv?.MOCK_MODE === 'true' ||
  (!globalEnv && !windowMock);

type MockStore = {
  tenants: TenantDetail[];
  notes: Note[];
  timeline: Record<string, TimelineEvent[]>;
  preferences: Record<string, TenantPreferences>;
  files: TenantFile[];
  notifications: Array<{ id: string; tenantId: string; at: string; body: string }>;
};

const mockStore: MockStore = createInitialMockStore();

function createInitialMockStore(): MockStore {
  const baseTenants: TenantDetail[] = [
    {
      id: 'tnt_alice',
      name: 'Alice Tenant',
      email: 'alice@example.com',
      phone: '+61 400 111 222',
      statuses: ['A_GRADE'],
      address: '12 Sunset Way, Carlton',
      lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      bestContactTime: '09:00',
    },
    {
      id: 'tnt_bob',
      name: 'Bob Renter',
      email: 'bob@example.com',
      phone: '+61 400 333 444',
      statuses: ['WATCHLIST'],
      address: '88 Harbour Street, Southbank',
      lastInteractionAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'tnt_charlie',
      name: 'Charlie Prospect',
      email: 'charlie@example.com',
      phone: '+61 400 555 999',
      statuses: ['PROSPECT'],
      address: 'Prospect - 17 Green Lane',
      lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
  ];

  const now = new Date();
  const toISO = (d: Date) => d.toISOString();

  const notes: Note[] = [
    {
      id: 'note_alice_1',
      tenantId: 'tnt_alice',
      body: 'Tenant called to confirm maintenance access window next Tuesday.',
      tags: ['maintenance'],
      followUpAt: null,
      createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 25)),
      author: 'Ava Property Manager',
    },
    {
      id: 'note_bob_1',
      tenantId: 'tnt_bob',
      body: 'Sent arrears reminder, agreed to make payment Friday.',
      tags: ['arrears'],
      followUpAt: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 48)),
      createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 4)),
      author: 'Jordan Field Agent',
    },
  ];

  const timeline: MockStore['timeline'] = {
    tnt_alice: [
      { type: 'payment', id: 'pay_1', at: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24)), amount: 520, status: 'posted' },
      { type: 'message', id: 'msg_1', at: toISO(new Date(now.getTime() - 1000 * 60 * 55)), channel: 'sms', direction: 'out' },
    ],
    tnt_bob: [
      { type: 'payment', id: 'pay_2', at: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 48)), amount: 450, status: 'late' },
      { type: 'message', id: 'msg_2', at: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 6)), channel: 'email', direction: 'out' },
    ],
    tnt_charlie: [
      { type: 'lease', id: 'lease_1', at: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)), event: 'start' },
    ],
  };

  for (const note of notes) {
    timeline[note.tenantId] = timeline[note.tenantId] || [];
    timeline[note.tenantId].push({
      type: 'note',
      id: note.id,
      at: note.createdAt,
      tag: note.tags[0],
      snippet: note.body.slice(0, 120),
    });
  }

  const preferences: MockStore['preferences'] = {
    tnt_alice: {
      email: true,
      sms: true,
      push: false,
      quietHoursStart: '21:00',
      quietHoursEnd: '07:00',
      bestContactTime: '09:00',
    },
    tnt_bob: { email: true, sms: false, push: false, bestContactTime: '14:00' },
    tnt_charlie: { email: true, sms: true, push: true },
  };

  const files: TenantFile[] = [
    {
      id: 'file1',
      tenantId: 'tnt_alice',
      name: 'Lease Agreement.pdf',
      type: 'Lease',
      uploadedAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 40)),
      url: '#',
    },
    {
      id: 'file2',
      tenantId: 'tnt_bob',
      name: 'Condition Report.jpg',
      type: 'Inspection',
      uploadedAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)),
    },
  ];

  return {
    tenants: baseTenants,
    notes,
    timeline,
    preferences,
    files,
    notifications: [],
  };
}

function nextId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export type TenantListQuery = {
  search?: string;
  filters: TenantListFilters;
};

async function requestTenants(query: TenantListQuery): Promise<TenantListItem[]> {
  if (!MOCK_MODE) {
    const searchParams = new URLSearchParams();
    if (query.search) searchParams.set('search', query.search);
    if (query.filters.statuses.length) {
      searchParams.set('status', query.filters.statuses.join(','));
    }
    if (query.filters.arrearsOnly) searchParams.set('arrearsOnly', 'true');
    if (query.filters.nextInspectionInDays) {
      searchParams.set('nextInspectionInDays', String(query.filters.nextInspectionInDays));
    }
    return api<TenantListItem[]>(`/tenants?${searchParams.toString()}`);
  }

  const { search, filters } = query;
  const normalized = search?.trim().toLowerCase();
  const matchesSearch = (tenant: TenantDetail) => {
    if (!normalized) return true;
    return [tenant.name, tenant.email, tenant.phone]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(normalized));
  };

  const matchesStatus = (tenant: TenantDetail) => {
    if (!filters.statuses.length) return true;
    return filters.statuses.every((status) => tenant.statuses.includes(status));
  };

  const results = mockStore.tenants
    .filter(matchesSearch)
    .filter(matchesStatus)
    .map<TenantListItem>((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.statuses[0] ?? 'PROSPECT',
      hasOverdue: tenant.statuses.includes('WATCHLIST'),
      avatarUrl: null,
    }));

  if (filters.arrearsOnly) {
    return results.filter((tenant) => tenant.status === 'WATCHLIST');
  }

  return results;
}

async function requestTenant(id: string): Promise<TenantDetail | undefined> {
  if (!MOCK_MODE) {
    return api<TenantDetail>(`/tenants/${id}`);
  }
  return mockStore.tenants.find((tenant) => tenant.id === id);
}

async function requestNotes(tenantId: string): Promise<Note[]> {
  if (!MOCK_MODE) {
    return api<Note[]>(`/tenants/${tenantId}/notes`);
  }
  return mockStore.notes
    .filter((note) => note.tenantId === tenantId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function requestTimeline(tenantId: string, cursor?: string) {
  if (!MOCK_MODE) {
    const searchParams = new URLSearchParams();
    if (cursor) searchParams.set('cursor', cursor);
    return api<{ items: TimelineEvent[]; nextCursor?: string }>(
      `/tenants/${tenantId}/timeline?${searchParams.toString()}`
    );
  }

  const events = [...(mockStore.timeline[tenantId] ?? [])].sort((a, b) =>
    a.at > b.at ? -1 : 1
  );

  const startIndex = cursor ? events.findIndex((ev) => ev.id === cursor) + 1 : 0;
  const pageItems = events.slice(startIndex, startIndex + 20);
  const next = startIndex + 20 < events.length ? events[startIndex + 19]?.id : undefined;
  return {
    items: pageItems,
    nextCursor: next,
  };
}

async function requestPreferences(tenantId: string) {
  if (!MOCK_MODE) {
    return api<TenantPreferences>(`/tenants/${tenantId}/preferences`);
  }
  return mockStore.preferences[tenantId] ?? {
    email: true,
    sms: true,
    push: false,
  };
}

async function savePreferences(tenantId: string, prefs: TenantPreferences) {
  if (!MOCK_MODE) {
    return api<TenantPreferences>(`/tenants/${tenantId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }
  mockStore.preferences[tenantId] = { ...prefs };
  return mockStore.preferences[tenantId];
}

async function requestFiles(tenantId: string) {
  if (!MOCK_MODE) {
    return api<TenantFile[]>(`/tenants/${tenantId}/files`);
  }
  return mockStore.files
    .filter((file) => file.tenantId === tenantId)
    .sort((a, b) => (a.uploadedAt > b.uploadedAt ? -1 : 1));
}

async function uploadFile(tenantId: string, file: File, type: string) {
  if (!MOCK_MODE) {
    const form = new FormData();
    form.set('file', file);
    form.set('type', type);
    return api<TenantFile>(`/tenants/${tenantId}/files`, {
      method: 'POST',
      body: form,
    });
  }
  const entry: TenantFile = {
    id: nextId('file'),
    tenantId,
    name: file.name,
    type,
    uploadedAt: new Date().toISOString(),
  };
  mockStore.files.unshift(entry);
  return entry;
}

async function createNote(input: NoteInput): Promise<Note> {
  if (!MOCK_MODE) {
    return api<Note>(`/tenants/${input.tenantId}/notes`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
  const note: Note = {
    ...input,
    id: nextId('note'),
    createdAt: new Date().toISOString(),
    author: 'You',
  };
  mockStore.notes.unshift(note);
  mockStore.timeline[input.tenantId] = mockStore.timeline[input.tenantId] ?? [];
  mockStore.timeline[input.tenantId].unshift({
    type: 'note',
    id: note.id,
    at: note.createdAt,
    tag: input.tags[0],
    snippet: input.body.slice(0, 120),
  });

  if (input.followUpAt) {
    mockStore.notifications.push({
      id: nextId('notification'),
      tenantId: input.tenantId,
      at: input.followUpAt,
      body: `Reminder for ${input.tenantId}: ${input.body.slice(0, 60)}`,
    });
  }

  return note;
}

async function updateNote(noteId: string, input: Partial<NoteInput>): Promise<Note> {
  if (!MOCK_MODE) {
    return api<Note>(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
  const note = mockStore.notes.find((n) => n.id === noteId);
  if (!note) {
    throw new Error('Note not found');
  }
  Object.assign(note, input, { updatedAt: new Date().toISOString() });

  const tenantTimeline = mockStore.timeline[note.tenantId] ?? [];
  const timelineEntry = tenantTimeline.find((entry) => entry.type === 'note' && entry.id === noteId);
  if (timelineEntry && timelineEntry.type === 'note') {
    timelineEntry.snippet = note.body.slice(0, 120);
    timelineEntry.tag = note.tags[0];
  }

  return note;
}

async function deleteNote(noteId: string) {
  if (!MOCK_MODE) {
    await api<void>(`/notes/${noteId}`, { method: 'DELETE' });
    return;
  }
  const index = mockStore.notes.findIndex((note) => note.id === noteId);
  if (index !== -1) {
    const [removed] = mockStore.notes.splice(index, 1);
    const events = mockStore.timeline[removed.tenantId];
    if (events) {
      mockStore.timeline[removed.tenantId] = events.filter((entry) => entry.id !== noteId);
    }
  }
}

export function useTenants(query: TenantListQuery) {
  return useQuery({
    queryKey: ['tenants', query],
    queryFn: () => requestTenants(query),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTenant(id?: string) {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => (id ? requestTenant(id) : undefined),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNotes(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant', tenantId, 'notes'],
    queryFn: () => (tenantId ? requestNotes(tenantId) : []),
    enabled: Boolean(tenantId),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation<Note, Error, NoteInput, { previousNotes?: Note[] }>({
    mutationFn: createNote,
    onMutate: async (input: NoteInput) => {
      await queryClient.cancelQueries({ queryKey: ['tenant', input.tenantId, 'notes'] });
      const previousNotes = queryClient.getQueryData<Note[]>(['tenant', input.tenantId, 'notes']);
      const optimistic: Note = {
        ...input,
        id: nextId('note_tmp'),
        createdAt: new Date().toISOString(),
        author: 'You',
      };
      queryClient.setQueryData<Note[]>(['tenant', input.tenantId, 'notes'], (old = []) => [
        optimistic,
        ...old,
      ]);
      return { previousNotes };
    },
    onError: (_error: unknown, input: NoteInput, context?: { previousNotes?: Note[] }) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['tenant', input.tenantId, 'notes'], context.previousNotes);
      }
    },
    onSuccess: (note: Note) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', note.tenantId, 'notes'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', note.tenantId, 'timeline'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  type UpdateVariables = { id: string; input: Partial<NoteInput> & { tenantId: string } };
  return useMutation<Note, Error, UpdateVariables, { previous?: Note[] }>({
    mutationFn: ({ id, input }: UpdateVariables) => updateNote(id, input),
    onMutate: async ({ id, input }: UpdateVariables) => {
      const notesQueryKey: QueryKey = ['tenant', input.tenantId, 'notes'];
      await queryClient.cancelQueries({ queryKey: notesQueryKey });
      const previous = queryClient.getQueryData<Note[]>(notesQueryKey);
      queryClient.setQueryData<Note[]>(notesQueryKey, (old = []) =>
        old.map((note) => (note.id === id ? { ...note, ...input } : note))
      );
      return { previous };
    },
    onError: (_err: unknown, vars: UpdateVariables, context?: { previous?: Note[] }) => {
      const key: QueryKey = ['tenant', vars.input.tenantId, 'notes'];
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (note: Note) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', note.tenantId, 'notes'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', note.tenantId, 'timeline'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; tenantId: string }, { previous?: Note[] }>({
    mutationFn: ({ id }: { id: string; tenantId: string }) => deleteNote(id),
    onMutate: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const key: QueryKey = ['tenant', tenantId, 'notes'];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Note[]>(key);
      queryClient.setQueryData<Note[]>(key, (old = []) => old.filter((note) => note.id !== id));
      return { previous };
    },
    onError: (_err: unknown, vars: { id: string; tenantId: string }, context?: { previous?: Note[] }) => {
      const key: QueryKey = ['tenant', vars.tenantId, 'notes'];
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (_result: void, vars: { id: string; tenantId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', vars.tenantId, 'notes'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', vars.tenantId, 'timeline'] });
    },
  });
}

export function useTimeline(tenantId?: string) {
  return useInfiniteQuery<{ items: TimelineEvent[]; nextCursor?: string }>({
    queryKey: ['tenant', tenantId, 'timeline'],
    enabled: Boolean(tenantId),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      tenantId ? requestTimeline(tenantId, pageParam) : { items: [] },
    getNextPageParam: (lastPage: { nextCursor?: string }) => lastPage?.nextCursor,
  });
}

export function usePreferences(tenantId?: string) {
  const query = useQuery({
    queryKey: ['tenant', tenantId, 'preferences'],
    enabled: Boolean(tenantId),
    queryFn: () => (tenantId ? requestPreferences(tenantId) : undefined),
  });

  return query;
}

export function useSavePreferences() {
  const queryClient = useQueryClient();
  return useMutation<
    TenantPreferences,
    Error,
    { tenantId: string; data: TenantPreferences },
    unknown
  >({
    mutationFn: ({ tenantId, data }) => savePreferences(tenantId, data),
    onSuccess: (_result: TenantPreferences, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId, 'preferences'] });
    },
  });
}

export function useFiles(tenantId?: string) {
  return useQuery({
    queryKey: ['tenant', tenantId, 'files'],
    enabled: Boolean(tenantId),
    queryFn: () => (tenantId ? requestFiles(tenantId) : []),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation<
    TenantFile,
    Error,
    { tenantId: string; file: File; type: string },
    unknown
  >({
    mutationFn: ({ tenantId, file, type }) => uploadFile(tenantId, file, type),
    onSuccess: (_data: TenantFile, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', vars.tenantId, 'files'] });
    },
  });
}

