import { randomUUID } from 'crypto';
import { properties, reminders, isActiveProperty, tenants } from '../store';
import { tenantDirectory, nextId } from '../tenant-crm/store';
import {
  zTenant,
  zTenantCreate,
  type Tenant as TenantCrm,
} from '../../../lib/tenant-crm/schemas';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const maybeCreateTenantCrmRecord = (
  propertyId: string,
  payload: unknown,
  tenantName: string
): TenantCrm | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;

  const body = payload as Record<string, unknown>;

  if (typeof body.tenantCrmId === 'string' || typeof body.tenantId === 'string') {
    return undefined;
  }

  const rawDetails =
    (isRecord(body.tenantDetails) && body.tenantDetails) ||
    (isRecord(body.tenantCrm) && body.tenantCrm) ||
    (isRecord(body.newTenant) && body.newTenant) ||
    undefined;

  const fallbackName = typeof tenantName === 'string' ? tenantName.trim() : '';
  const rawFullName =
    rawDetails && typeof rawDetails['fullName'] === 'string'
      ? (rawDetails['fullName'] as string).trim()
      : undefined;
  const fullName = rawFullName || fallbackName;

  if (!fullName) return undefined;

  if (tenantDirectory.some((tenant) => tenant.currentPropertyId === propertyId)) {
    return undefined;
  }

  const parsed = zTenantCreate.safeParse({
    ...(rawDetails ?? {}),
    fullName,
    currentPropertyId:
      rawDetails && typeof rawDetails['currentPropertyId'] === 'string'
        ? (rawDetails['currentPropertyId'] as string)
        : propertyId,
  });

  if (!parsed.success) {
    return undefined;
  }

  if (
    tenantDirectory.some(
      (tenant) =>
        tenant.fullName.toLowerCase() === parsed.data.fullName.toLowerCase() &&
        tenant.currentPropertyId === parsed.data.currentPropertyId
    )
  ) {
    return undefined;
  }

  const timestamp = new Date().toISOString();
  const tenant = zTenant.parse({
    id: nextId('tenant'),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...parsed.data,
  });

  tenantDirectory.push(tenant);
  return tenant;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === 'true';
  const props = includeArchived ? properties : properties.filter(isActiveProperty);
  const data = props.map((p) => ({
    id: p.id,
    address: p.address,
    imageUrl: p.imageUrl,
    tenant: p.tenant,
    rent: p.rent,
    leaseStart: p.leaseStart,
    leaseEnd: p.leaseEnd,
    value: p.value,
    events: reminders
      .filter((r) => r.propertyId === p.id)
      .map((r) => ({ date: r.dueDate, title: r.title, severity: r.severity })),
  }));
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = body.id || randomUUID();
  const property = {
    id,
    address: body.address || '',
    imageUrl: body.imageUrl,
    tenant: body.tenant || '',
    leaseStart: body.leaseStart || '',
    leaseEnd: body.leaseEnd || '',
    rent: typeof body.rent === 'number' ? body.rent : Number(body.rent) || 0,
    value: typeof body.value === 'number' ? body.value : body.value ? Number(body.value) : undefined,
    archived: body.archived ?? false,
  };
  properties.push(property);
  const tenantRecord = maybeCreateTenantCrmRecord(id, body, property.tenant);
  if (tenantRecord) {
    tenants.push({ id: tenantRecord.id, name: tenantRecord.fullName, propertyId: id });
  }
  const events = reminders
    .filter((r) => r.propertyId === id)
    .map((r) => ({ date: r.dueDate, title: r.title, severity: r.severity }));
  return Response.json({ ...property, events }, { status: 201 });
}
