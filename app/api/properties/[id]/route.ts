import { properties, reminders } from '../../store';

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
    .map((r) => ({ date: r.dueDate, title: r.title }));
  return Response.json({ ...property, events });
}
