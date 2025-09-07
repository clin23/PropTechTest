import { calculatePnL } from './helpers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId') || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const includeArchived = searchParams.get('includeArchived') === 'true';
  const data = calculatePnL({ propertyId, from, to, includeArchived });
  return Response.json(data);
}
