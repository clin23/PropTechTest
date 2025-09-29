import { properties } from '../../../store';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const property = properties.find((p) => p.id === params.id);
  if (!property) {
    return new Response('Not found', { status: 404 });
  }
  property.archived = false;
  return new Response(null, { status: 204 });
}
