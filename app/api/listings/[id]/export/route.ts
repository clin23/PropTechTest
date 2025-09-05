import { listings } from '../../../store';
import type { Listing } from '../../../../../types/listing';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const listing: Listing | undefined = listings.find((l) => l.id === params.id);
  const content = `Listing pack for property ${listing?.property || ''}`;
  const data = new TextEncoder().encode(content);
  return new Response(data, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=listing-${params.id}.zip`,
    },
  });
}
