import { z } from 'zod';

import { logEvent } from '../../../lib/log';
import { commLogStore, nextId } from '../tenant-crm/store';
import {
  zCommLogCreate,
  zCommLogEntry,
  zCommLogListResponse,
} from '../../../lib/tenant-crm/schemas';

const querySchema = z.object({
  tenantId: z.string().optional(),
  type: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.format()), { status: 400 });
  }

  const { tenantId, type, dateFrom, dateTo, page, pageSize } = parsed.data;
  const filtered = commLogStore
    .filter((entry) => {
      if (tenantId && entry.tenantId !== tenantId) return false;
      if (type && entry.type !== type) return false;
      if (dateFrom && entry.when < dateFrom) return false;
      if (dateTo && entry.when > dateTo) return false;
      return true;
    })
    .sort((a, b) => (a.when < b.when ? 1 : -1));

  const start = page * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const payload = zCommLogListResponse.parse({
    items,
    pageInfo: { page, pageSize, total: filtered.length },
  });

  return Response.json(payload);
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = zCommLogCreate.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.format()), { status: 400 });
  }

  const entry = zCommLogEntry.parse({
    id: nextId('comm'),
    attachments: [],
    ...parsed.data,
  });

  commLogStore.unshift(entry);
  logEvent('comm_logged', { tenantId: entry.tenantId, type: entry.type });
  return new Response(JSON.stringify(entry), { status: 201 });
}
