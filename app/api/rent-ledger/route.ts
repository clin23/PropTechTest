import { rentLedger } from '../store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('propertyId');
  let balance = 0;
  const entries = rentLedger
    .filter((e) => !propertyId || e.propertyId === propertyId)
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
