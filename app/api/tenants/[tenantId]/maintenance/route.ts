import { NextResponse } from 'next/server';

import { getTenantWorkspace, recordMaintenance } from '../../../../../lib/tenants/mock-store';

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const vendorName = typeof payload.vendorName === 'string' ? payload.vendorName : undefined;
  const status = typeof payload.status === 'string' ? payload.status : undefined;

  if (!title) {
    return NextResponse.json({ message: 'Title required' }, { status: 400 });
  }

  try {
    const job = recordMaintenance(params.tenantId, { title, vendorName, status });
    return NextResponse.json(job, { status: 201 });
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
  return NextResponse.json({ items: tenant.maintenance });
}
