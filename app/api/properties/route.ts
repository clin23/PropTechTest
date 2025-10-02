import { randomUUID } from 'crypto';
import { properties, reminders, isActiveProperty } from '../store';
import { syncTenantForProperty } from './tenant-sync';

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
  syncTenantForProperty(id, property.tenant);
  const events = reminders
    .filter((r) => r.propertyId === id)
    .map((r) => ({ date: r.dueDate, title: r.title, severity: r.severity }));
  return Response.json({ ...property, events }, { status: 201 });
}
