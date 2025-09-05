import { tenancies, properties } from '../store';

export async function GET() {
  const leases = tenancies.map((t) => ({
    id: t.id,
    propertyId: t.propertyId,
    currentRent: t.currentRent,
    nextReview: t.nextReview,
    address: properties.find((p) => p.id === t.propertyId)?.address || '',
  }));
  return Response.json(leases);
}
