import { listings } from '../store';
import type { Listing } from '../../../types/listing';

export async function GET() {
  return Response.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const listing: Listing = { id: String(listings.length + 1), ...body };
  listings.push(listing);
  return Response.json(listing);
}
