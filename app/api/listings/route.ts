import { listings } from '../store';

export async function GET() {
  return Response.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const listing = { id: String(listings.length + 1), ...body };
  listings.push(listing);
  return Response.json(listing);
}
