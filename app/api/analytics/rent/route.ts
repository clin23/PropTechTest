import { rentLedger, properties, isActiveProperty } from '../../store';
import { seedIfEmpty } from '../../store';
import type { RentMetrics } from '../../../../types/analytics';

function getRange(search: URLSearchParams) {
  const from = search.get('from');
  const to = search.get('to');
  if (from && to) return { from: new Date(from), to: new Date(to) };
  const dates = rentLedger.map((r) => r.dueDate).sort();
  const latest = dates[dates.length - 1];
  const toDate = latest ? new Date(latest) : new Date();
  const fromDate = new Date(toDate);
  fromDate.setMonth(fromDate.getMonth() - 5);
  fromDate.setDate(1);
  return { from: fromDate, to: toDate };
}

export function computeRentMetrics(params: {
  from?: Date;
  to?: Date;
  propertyId?: string;
}): RentMetrics {
  const { from, to, propertyId } = params;
  const fromDate = from || new Date('1970-01-01');
  const toDate = to || new Date('2100-01-01');
  const allowed = propertyId
    ? [propertyId]
    : properties.filter(isActiveProperty).map((p) => p.id);

  const entries = rentLedger.filter(
    (e) =>
      allowed.includes(e.propertyId) &&
      new Date(e.dueDate) >= fromDate &&
      new Date(e.dueDate) <= toDate,
  );

  const expected = entries.reduce((sum, e) => sum + e.amount, 0);
  const received = entries
    .filter((e) => e.status === 'paid' && new Date(e.paidDate || e.dueDate) >= fromDate && new Date(e.paidDate || e.dueDate) <= toDate)
    .reduce((sum, e) => sum + e.amount, 0);
  const arrearsEntries = entries.filter((e) => e.status !== 'paid');
  const arrearsAmount = arrearsEntries.reduce((s, e) => s + e.amount, 0);
  const arrearsCount = arrearsEntries.length;
  const collectionRate = expected ? received / expected : 0;
  return { expected, received, collectionRate, arrearsAmount, arrearsCount };
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = getRange(searchParams);
  const propertyId = searchParams.get('propertyId') || undefined;
  const data = computeRentMetrics({ from, to, propertyId });
  return Response.json(data);
}
