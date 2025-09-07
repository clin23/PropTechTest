import { properties, reminders } from '../store';

export async function GET() {
  const data = properties.map((p) => ({
    id: p.id,
    address: p.address,
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
