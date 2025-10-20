import { NextResponse } from 'next/server';

import { getTenantWorkspace } from '../../../../../lib/tenants/mock-store';

export async function GET(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor') ?? undefined;
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') ?? '20')));

  const tenant = getTenantWorkspace(params.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
  }

  const events = tenant.timeline.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
  let startIndex = 0;
  if (cursor) {
    const idx = events.findIndex((event) => event.id === cursor);
    if (idx >= 0) {
      startIndex = idx + 1;
    }
  }
  const slice = events.slice(startIndex, startIndex + limit);
  const nextCursor = slice.length === limit ? slice[slice.length - 1].id : undefined;

  return NextResponse.json({ items: slice, nextCursor });
}
