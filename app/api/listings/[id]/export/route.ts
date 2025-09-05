import { prisma } from '../../../../../lib/prisma';
import type { Listing } from '../../../../../types/listing';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = await prisma.mockData.findUnique({ where: { id: params.id } });
  const listing: Listing | undefined = row?.data as any;
  const content = `Listing pack for property ${listing?.property || ''}`;
  const data = new TextEncoder().encode(content);
  return new Response(data, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=listing-${params.id}.zip`,
    },
  });
}
