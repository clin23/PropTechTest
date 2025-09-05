import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const rows = await prisma.mockData.findMany({ where: { type: 'application' } });
  return Response.json(rows.map((r) => r.data));
}

export async function POST(req: Request) {
  const body = await req.json();
  const app = { id: randomUUID(), ...body };
  await prisma.mockData.create({ data: { id: app.id, type: 'application', data: app } });
  return Response.json(app);
}
