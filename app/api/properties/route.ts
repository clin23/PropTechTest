import { properties, reminders, isActiveProperty } from '../store';

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
    events: reminders
      .filter((r) => r.propertyId === p.id)
      .map((r) => ({ date: r.dueDate, title: r.title })),
  }));
  return Response.json(data);
}
