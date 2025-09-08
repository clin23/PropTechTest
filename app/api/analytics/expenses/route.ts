import { expenses, properties, isActiveProperty } from '../../store';
import { seedIfEmpty } from '../../store';
import type { ExpenseBreakdown } from '../../../../types/analytics';

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

export function computeExpenseBreakdown(params: {
  from?: Date;
  to?: Date;
  propertyId?: string;
}): ExpenseBreakdown {
  const { from, to, propertyId } = params;
  const fromDate = from || new Date('1970-01-01');
  const toDate = to || new Date('2100-01-01');
  const allowed = propertyId
    ? [propertyId]
    : properties.filter(isActiveProperty).map((p) => p.id);

  const filtered = expenses.filter(
    (e) =>
      allowed.includes(e.propertyId) &&
      new Date(e.date) >= fromDate &&
      new Date(e.date) <= toDate,
  );

  const map = new Map<string, number>();
  for (const e of filtered) {
    map.set(e.category, (map.get(e.category) || 0) + e.amount);
  }
  const slices = Array.from(map.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
  const total = slices.reduce((s, x) => s + x.amount, 0);
  return { slices, total };
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = getRange(searchParams);
  const propertyId = searchParams.get('propertyId') || undefined;
  const data = computeExpenseBreakdown({ from, to, propertyId });
  return Response.json(data);
}
