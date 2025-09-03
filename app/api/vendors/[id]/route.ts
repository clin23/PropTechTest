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
