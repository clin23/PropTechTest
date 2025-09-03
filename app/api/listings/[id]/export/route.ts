import { listings } from '../../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const listing = listings.find((l) => l.id === params.id);
  return Response.json({ text: `Listing for property ${listing?.propertyId || ''}`, assets: [] });
}
