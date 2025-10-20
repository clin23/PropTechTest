import { NextResponse } from 'next/server';

import { logEvent } from '../../../../lib/log';
import { commLogStore, tenantDirectory, tenancySummaries } from '../../tenant-crm/store';
import { syncTenantForProperty, unlinkTenantFromProperty } from '../../properties/tenant-sync';
import {
  zCommLogEntry,
  zTenant,
  zTenantDetailResponse,
  zTenantUpdate,
} from '../../../../lib/tenant-crm/schemas';

function findTenant(id: string) {
  return tenantDirectory.find((tenant) => tenant.id === id);
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const tenant = findTenant(params.id);
  if (!tenant) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const tenancies = tenancySummaries.filter((t) => t.tenantId === tenant.id);
  const latestContact = commLogStore
    .filter((entry) => entry.tenantId === tenant.id)
    .sort((a, b) => (a.when < b.when ? 1 : -1))[0];

  const payload = zTenantDetailResponse.parse({
    tenant,
    tenancies,
    latestArrears: tenant.riskFlags?.includes('arrears')
      ? { days: 14, balanceCents: 6500 }
      : null,
    lastContact: latestContact ? zCommLogEntry.parse(latestContact) : null,
  });

  return NextResponse.json(payload);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json().catch(() => null);
  const parsed = zTenantUpdate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const tenant = findTenant(params.id);
  if (!tenant) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const previousPropertyId = tenant.currentPropertyId;

  Object.assign(tenant, parsed.data, { updatedAt: new Date().toISOString() });
  const updated = zTenant.parse(tenant);

  const propertyChanged =
    parsed.data.currentPropertyId !== undefined && parsed.data.currentPropertyId !== previousPropertyId;

  if (propertyChanged && previousPropertyId && previousPropertyId !== updated.currentPropertyId) {
    unlinkTenantFromProperty(previousPropertyId);
  }

  if (updated.currentPropertyId) {
    syncTenantForProperty(updated.currentPropertyId, updated);
  }

  logEvent('tenant_updated', { tenantId: updated.id });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const tenantIndex = tenantDirectory.findIndex((t) => t.id === params.id);
  if (tenantIndex === -1) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const tenant = tenantDirectory[tenantIndex];
  const hasActiveTenancy = tenancySummaries.some(
    (t) => t.tenantId === tenant.id && t.status === 'ACTIVE'
  );

  if (hasActiveTenancy) {
    return NextResponse.json(
      { message: 'Tenant has active tenancy' },
      { status: 409 }
    );
  }

  if (tenant.currentPropertyId) {
    unlinkTenantFromProperty(tenant.currentPropertyId);
  }
  tenantDirectory.splice(tenantIndex, 1);
  logEvent('tenant_deleted', { tenantId: params.id });
  return NextResponse.json({ ok: true });
}
