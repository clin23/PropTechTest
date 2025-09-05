import { randomUUID } from 'crypto';
import { prisma } from '../../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const rows = await prisma.mockData.findMany({ where: { type: 'income' } });
  return Response.json(
    rows.map((r) => r.data).filter((i: any) => i.propertyId === params.id)
  );
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const income = { id: randomUUID(), propertyId: params.id, ...body };
  await prisma.mockData.create({
    data: { id: income.id, type: 'income', data: income },
  });
  const notifications = await prisma.mockData.findMany({ where: { type: 'notification' } });
  for (const n of notifications) {
    const data: any = n.data;
    if (data.propertyId === params.id && data.type === 'rentLate') {
      await prisma.mockData.delete({ where: { id: n.id } });
    }
  }
  return Response.json(income);
}
