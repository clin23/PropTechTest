import { prisma } from '../../../lib/prisma';

export async function GET() {
  const rows = await prisma.mockData.findMany({ where: { type: 'reminder' } });
  return Response.json(rows.map((r) => r.data));
}
