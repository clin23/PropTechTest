import { expenses } from '../../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return Response.json(expenses.filter((e) => e.propertyId === params.id));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const exp = { id: String(expenses.length + 1), propertyId: params.id, ...body };
  expenses.push(exp);
  return Response.json(exp);
}
