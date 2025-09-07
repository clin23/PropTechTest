import { reminders, properties, isActiveProperty } from '../store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === 'true';
  const propertyId = url.searchParams.get('propertyId');

  const activeProps = includeArchived
    ? properties
    : properties.filter(isActiveProperty);
  const map = new Map(activeProps.map((p) => [p.id, p.address]));

  let data = reminders.filter((r) => map.has(r.propertyId));
  if (propertyId) {
    data = data.filter((r) => r.propertyId === propertyId);
  }
  data = data.map((r) => ({
    ...r,
    propertyAddress: map.get(r.propertyId)!,
  }));

  return Response.json(data);
}
