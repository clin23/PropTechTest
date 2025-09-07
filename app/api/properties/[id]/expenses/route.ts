import { randomUUID } from 'crypto';
import { prisma } from '../../../../../lib/prisma';
import { logEvent } from '../../../../../lib/log';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const rows = await prisma.mockData.findMany({ where: { type: 'expense' } });
  return Response.json(rows.map((r) => r.data).filter((e: any) => e.propertyId === params.id));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const exp = { id: randomUUID(), propertyId: params.id, ...body };
  await prisma.mockData.create({ data: { id: exp.id, type: 'expense', data: exp } });
  logEvent('expense_create', { propertyId: params.id });
  return Response.json(exp);
}
