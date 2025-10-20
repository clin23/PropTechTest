import { NextResponse } from 'next/server';

import { getTenantWorkspace, recordNote } from '../../../../../lib/tenants/mock-store';

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const body = typeof payload.body === 'string' ? payload.body.trim() : '';
  const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
  const author = typeof payload.author === 'string' && payload.author ? payload.author : 'System';

  if (!body) {
    return NextResponse.json({ message: 'Note body required' }, { status: 400 });
  }

  try {
    const note = recordNote(params.tenantId, { body, tags, author });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 404 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { tenantId: string } }
) {
  const tenant = getTenantWorkspace(params.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
  }
  return NextResponse.json({ items: tenant.notes });
}
