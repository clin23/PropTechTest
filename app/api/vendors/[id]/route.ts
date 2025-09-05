import { vendors } from '../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const vendor = vendors.find((v) => v.id === params.id);
  return Response.json(vendor);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const vendor = vendors.find((v) => v.id === params.id);
  if (vendor) Object.assign(vendor, body);
  return Response.json(vendor);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const idx = vendors.findIndex((v) => v.id === params.id);
  if (idx !== -1) vendors.splice(idx, 1);
  return new Response(null, { status: 204 });
}
