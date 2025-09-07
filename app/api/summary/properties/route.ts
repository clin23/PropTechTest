import { properties, reminders, isActiveProperty } from '../../store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === 'true';
  const props = includeArchived ? properties : properties.filter(isActiveProperty);
  const data = props.map((p) => ({
    id: p.id,
    address: p.address,
    tenantName: p.tenant || 'Vacant',
    rentStatus: 'Paid',
    nextKeyDate:
      reminders.find((r) => r.propertyId === p.id)?.dueDate || '',
  }));
  return Response.json(data);
}
