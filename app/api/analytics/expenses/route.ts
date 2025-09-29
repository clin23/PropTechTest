import { expenses, seedIfEmpty } from '../../store';
import { computeExpenseBreakdown } from '../../../../lib/analytics/expenses';

function getRange(search: URLSearchParams) {
  const from = search.get('from');
  const to = search.get('to');
  if (from && to) return { from: new Date(from), to: new Date(to) };
  const dates = expenses.map((e) => e.date).sort();
  const latest = dates[dates.length - 1];
  const toDate = latest ? new Date(latest) : new Date();
  const fromDate = new Date(toDate);
  fromDate.setMonth(fromDate.getMonth() - 5);
  fromDate.setDate(1);
  return { from: fromDate, to: toDate };
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = getRange(searchParams);
  const propertyId = searchParams.get('propertyId') || undefined;
  const data = computeExpenseBreakdown({ from, to, propertyId });
  return Response.json(data);
}
