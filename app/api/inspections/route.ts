import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const rows = await prisma.mockData.findMany({ where: { type: 'inspection' } });
  return Response.json(rows.map((r) => r.data));
}

export async function POST(req: Request) {
  const body = await req.json();
  const inspection = { id: randomUUID(), ...body };
  await prisma.mockData.create({ data: { id: inspection.id, type: 'inspection', data: inspection } });
  return Response.json(inspection);
}
