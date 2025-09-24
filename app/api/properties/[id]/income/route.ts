import { randomUUID } from 'crypto';
import { prisma } from '../../../../../lib/prisma';
import { zIncome } from '../../../../../lib/validation';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const rows = await prisma.mockData.findMany({ where: { type: 'income' } });
  return Response.json(
    rows.map((r) => r.data).filter((i: any) => i.propertyId === params.id)
  );
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = zIncome.omit({ propertyId: true }).parse(body);
    const cleaned = { ...parsed } as any;
    if (cleaned.evidenceUrl == null || cleaned.evidenceUrl === "") {
      delete cleaned.evidenceUrl;
    }
    if (cleaned.evidenceName == null || cleaned.evidenceName === "") {
      delete cleaned.evidenceName;
    }
    const income = { id: randomUUID(), propertyId: params.id, ...cleaned };
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
  } catch (err: any) {
    return new Response(err.message, { status: 400 });
  }
}
