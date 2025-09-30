import { z } from 'zod';

import { logEvent } from '../../../lib/log';
import {
  tenantDirectory,
  nextId,
} from '../tenant-crm/store';
import {
  zTenant,
  zTenantCreate,
  zTenantDirectoryResponse,
} from '../../../lib/tenant-crm/schemas';

const querySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  riskFlag: z.string().optional(),
  propertyId: z.string().optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.format()), { status: 400 });
  }

  const { page, pageSize, search, tag, riskFlag, propertyId } = parsed.data;

  const filtered = tenantDirectory.filter((tenant) => {
    if (propertyId && tenant.currentPropertyId !== propertyId) return false;
    if (tag && !tenant.tags?.includes(tag)) return false;
    if (riskFlag && !tenant.riskFlags?.includes(riskFlag as any)) return false;
    if (search) {
      const value = search.toLowerCase();
      const match =
        tenant.fullName.toLowerCase().includes(value) ||
        tenant.email?.toLowerCase().includes(value) ||
        tenant.phone?.toLowerCase().includes(value);
      if (!match) return false;
    }
    return true;
  });

  const start = page * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const result = zTenantDirectoryResponse.parse({
    items,
    pageInfo: {
      page,
      pageSize,
      total: filtered.length,
    },
  });

  return Response.json(result);
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = zTenantCreate.safeParse(json);

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.format()), { status: 400 });
  }

  const id = nextId('tenant');
  const timestamp = new Date().toISOString();
  const tenant = zTenant.parse({
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
    tags: [],
    altContacts: [],
    riskFlags: [],
    ...parsed.data,
  });

  tenantDirectory.push(tenant);
  logEvent('tenant_created', { tenantId: id, propertyId: tenant.currentPropertyId });

  return new Response(JSON.stringify(tenant), { status: 201 });
}
