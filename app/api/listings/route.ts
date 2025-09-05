import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';
import type { Listing } from '../../../types/listing';

export async function GET() {
  const rows = await prisma.mockData.findMany({ where: { type: 'listing' } });
  return Response.json(rows.map((r) => r.data));
}

export async function POST(req: Request) {
  const body = await req.json();
  const listing: Listing = { id: randomUUID(), ...body };
  await prisma.mockData.create({ data: { id: listing.id, type: 'listing', data: listing } });
  return Response.json(listing);
}
