import { z } from 'zod';

import { logEvent } from '../../../lib/log';
import {
  tenantNotesStore,
  nextId,
} from '../tenant-crm/store';
import {
  zTenantNote,
  zTenantNoteCreate,
  zTenantNoteListResponse,
} from '../../../lib/tenant-crm/schemas';

const querySchema = z.object({
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.format()), { status: 400 });
  }

  const { tenantId, propertyId, tag, page, pageSize } = parsed.data;
  const filtered = tenantNotesStore
    .filter((note) => {
      if (tenantId && note.tenantId !== tenantId) return false;
      if (propertyId && note.propertyId !== propertyId) return false;
      if (tag && !note.tags?.includes(tag)) return false;
      return true;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const start = page * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const payload = zTenantNoteListResponse.parse({
    items,
    pageInfo: { page, pageSize, total: filtered.length },
  });

  return Response.json(payload);
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = zTenantNoteCreate.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.format()), { status: 400 });
  }

  const note = zTenantNote.parse({
    id: nextId('tenantNote'),
    createdAt: new Date().toISOString(),
    tags: [],
    attachments: [],
    pinned: false,
    ...parsed.data,
  });

  tenantNotesStore.unshift(note);
  logEvent('tenant_note_created', { tenantId: note.tenantId });
  return new Response(JSON.stringify(note), { status: 201 });
}
