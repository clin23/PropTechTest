import {
  properties,
  reminders,
  tenants,
  expenses,
  incomes,
  documents,
  rentLedger,
  notifications,
  tenantNotes,
} from '../../store';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const property = properties.find((p) => p.id === params.id);
  if (!property) {
    return new Response('Not found', { status: 404 });
  }
  const events = reminders
    .filter((r) => r.propertyId === params.id)
    .map((r) => ({ date: r.dueDate, title: r.title, severity: r.severity }));
  return Response.json({ ...property, events });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const property = properties.find((p) => p.id === params.id);
  if (!property) return new Response('Not found', { status: 404 });
  const body = await req.json();
  if (body.address !== undefined) property.address = body.address;
  if (body.imageUrl !== undefined) property.imageUrl = body.imageUrl;
  if (body.tenant !== undefined) property.tenant = body.tenant;
  if (body.leaseStart !== undefined) property.leaseStart = body.leaseStart;
  if (body.leaseEnd !== undefined) property.leaseEnd = body.leaseEnd;
  if (body.rent !== undefined)
    property.rent = typeof body.rent === 'number' ? body.rent : Number(body.rent) || 0;
  if (body.archived !== undefined) property.archived = body.archived;
  const events = reminders
    .filter((r) => r.propertyId === params.id)
    .map((r) => ({ date: r.dueDate, title: r.title, severity: r.severity }));
  return Response.json({ ...property, events });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const idx = properties.findIndex((p) => p.id === params.id);
  if (idx === -1) return new Response('Not found', { status: 404 });
  properties.splice(idx, 1);
  for (const arr of [tenants, expenses, incomes, documents, rentLedger, notifications, tenantNotes, reminders]) {
    let i = arr.length;
    while (i--) {
      if ((arr[i] as any).propertyId === params.id) arr.splice(i, 1);
    }
  }
  return new Response(null, { status: 204 });
}
