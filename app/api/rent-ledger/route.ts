import { rentLedger, properties, isActiveProperty } from '../store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('propertyId');
  const includeArchived = url.searchParams.get('includeArchived') === 'true';
  let balance = 0;
  const allowedIds = propertyId
    ? [propertyId]
    : (includeArchived ? properties : properties.filter(isActiveProperty)).map((p) => p.id);
  const entries = rentLedger
    .filter((e) => allowedIds.includes(e.propertyId))
    .map((e) => {
      balance += e.status === 'paid' ? e.amount : 0;
      return {
        id: e.id,
        date: e.dueDate,
        description: e.status === 'paid' ? 'Rent paid' : 'Rent due',
        amount: e.amount,
        balance,
      };
    });
  return Response.json(entries);
}
