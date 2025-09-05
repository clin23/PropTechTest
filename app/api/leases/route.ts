import { prisma } from '../../../lib/prisma';

export async function GET() {
  const tenancyRows = await prisma.mockData.findMany({ where: { type: 'tenancy' } });
  const propertyRows = await prisma.mockData.findMany({ where: { type: 'property' } });
  const leases = tenancyRows.map((t) => {
    const tenancy: any = t.data;
    const property = propertyRows.find((p) => p.id === tenancy.propertyId)?.data as any;
    return {
      id: t.id,
      propertyId: tenancy.propertyId,
      currentRent: tenancy.currentRent,
      nextReview: tenancy.nextReview,
      address: property?.address || '',
    };
  });
  return Response.json(leases);
}
