import { rentLedger, properties, isActiveProperty, incomes } from '../store';

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
      const matchingIncome = incomes
        .filter((income) => income.propertyId === e.propertyId && income.date === e.dueDate)
        .find((income) => income.evidenceUrl);
      const evidenceUrl = e.evidenceUrl ?? matchingIncome?.evidenceUrl;
      const evidenceName =
        e.evidenceName ??
        matchingIncome?.evidenceName ??
        matchingIncome?.label ??
        matchingIncome?.category;
      return {
        id: e.id,
        date: e.dueDate,
        amount: e.amount,
        balance,
        status: e.status,
        evidenceUrl,
        evidenceName,
      };
    });
  return Response.json(entries);
}
