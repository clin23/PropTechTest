import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const rows = await prisma.mockData.findMany({ where: { type: 'vendor' } });
  return Response.json(rows.map((r) => r.data));
}

export async function POST(req: Request) {
  const body = await req.json();
  const vendor = {
    id: randomUUID(),
    insured: false,
    licensed: false,
    avgResponseTime: undefined,
    documents: [],
    ...body,
  };
  await prisma.mockData.create({ data: { id: vendor.id, type: 'vendor', data: vendor } });
  return Response.json(vendor);
}
