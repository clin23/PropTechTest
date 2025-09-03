import { inspections } from '../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const insp = inspections.find((i) => i.id === params.id);
  return Response.json(insp);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const insp = inspections.find((i) => i.id === params.id);
  if (insp) Object.assign(insp, body);
  return Response.json(insp);
}
