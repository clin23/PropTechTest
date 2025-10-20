import { NextResponse } from 'next/server';

import {
  listSavedFilters,
  listTenants,
  saveFilters,
} from '../../../lib/tenants/mock-store';
import type { TenantTag } from '../../../lib/tenants/types';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? undefined;
  const tagsParam = url.searchParams.get('tags');
  const tags = tagsParam ? (tagsParam.split(',').filter(Boolean) as TenantTag[]) : undefined;
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Math.max(1, Math.min(50, Number(limitParam))) : undefined;
  const cursor = url.searchParams.get('cursor') ?? undefined;
  const arrearsOnly = url.searchParams.get('arrearsOnly') === 'true';

  const { items, nextCursor } = listTenants({ q, tags, limit, cursor, arrearsOnly });

  return NextResponse.json({ items, nextCursor });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const userId = typeof body.userId === 'string' ? body.userId : undefined;
  const name = typeof body.name === 'string' ? body.name : undefined;
  const query = typeof body.query === 'object' && body.query ? body.query : undefined;

  if (!userId || !name || !query) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const filter = {
    id: `filter-${Date.now()}`,
    userId,
    name,
    query,
    updatedAt: new Date().toISOString(),
  };

  saveFilters(userId, filter);

  return NextResponse.json(filter, { status: 201 });
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
  }
  const filters = listSavedFilters(userId);
  return NextResponse.json({ items: filters });
}
