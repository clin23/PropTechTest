import { reminders, properties, isActiveProperty } from '../store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === 'true';

  const activeProps = includeArchived
    ? properties
    : properties.filter(isActiveProperty);
  const map = new Map(activeProps.map((p) => [p.id, p.address]));

  const data = reminders
    .filter((r) => map.has(r.propertyId))
    .map((r) => ({
      ...r,
      propertyAddress: map.get(r.propertyId)!,
    }));

  return Response.json(data);
}
