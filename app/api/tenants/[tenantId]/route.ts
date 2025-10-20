import { NextResponse } from 'next/server';

import { getTenantWorkspace } from '../../../../lib/tenants/mock-store';

export async function GET(
  _request: Request,
  { params }: { params: { tenantId: string } }
) {
  const tenant = getTenantWorkspace(params.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
  }
  return NextResponse.json(tenant);
}
