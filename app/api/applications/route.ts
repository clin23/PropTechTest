import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');
  const rows = await prisma.mockData.findMany({ where: { type: 'application' } });
  let data = rows.map((r) => r.data as any);
  if (propertyId) data = data.filter((a) => a.propertyId === propertyId);
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const app = { id: randomUUID(), ...body };
  await prisma.mockData.create({ data: { id: app.id, type: 'application', data: app } });
  return Response.json(app);
}
