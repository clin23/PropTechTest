import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const rows = await prisma.mockData.findMany({ where: { type: 'inspection' } });
  let data = rows.map((r) => r.data as any);
  if (propertyId) data = data.filter((i) => i.propertyId === propertyId);
  if (type) data = data.filter((i) => i.type === type);
  if (status) data = data.filter((i) => i.status === status);
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const inspection = { id: randomUUID(), ...body };
  await prisma.mockData.create({ data: { id: inspection.id, type: 'inspection', data: inspection } });
  return Response.json(inspection);
}
