import { applications } from '../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const app = applications.find((a) => a.id === params.id);
  return Response.json(app);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const app = applications.find((a) => a.id === params.id);
  if (app) Object.assign(app, body);
  return Response.json(app);
}
