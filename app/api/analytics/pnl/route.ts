import { rentLedger, expenses, properties, isActiveProperty } from '../../store';
import { seedIfEmpty } from '../../store';
import type { PnLSeries } from '../../../../types/analytics';

function getRange(search: URLSearchParams) {
  const from = search.get('from');
  const to = search.get('to');
  if (from && to) return { from: new Date(from), to: new Date(to) };
  const dates = [
    ...rentLedger.map((r) => r.paidDate || r.dueDate),
    ...expenses.map((e) => e.date),
  ].sort();
  const latest = dates[dates.length - 1];
  const toDate = latest ? new Date(latest) : new Date();
  const fromDate = new Date(toDate);
  fromDate.setMonth(fromDate.getMonth() - 5);
  fromDate.setDate(1);
  return { from: fromDate, to: toDate };
}

export function computePnL(params: {
  from?: Date;
  to?: Date;
  propertyId?: string;
}): PnLSeries {
  const { from, to, propertyId } = params;
  const fromDate = from || new Date('1970-01-01');
  const toDate = to || new Date('2100-01-01');
  const allowed = propertyId
    ? [propertyId]
    : properties.filter(isActiveProperty).map((p) => p.id);

  const incomeEntries = rentLedger.filter(
    (e) =>
      e.status === 'paid' &&
      allowed.includes(e.propertyId) &&
      new Date(e.paidDate || e.dueDate) >= fromDate &&
      new Date(e.paidDate || e.dueDate) <= toDate,
  );
  const expenseEntries = expenses.filter(
    (e) =>
      allowed.includes(e.propertyId) &&
      new Date(e.date) >= fromDate &&
      new Date(e.date) <= toDate,
  );

  const seriesMap = new Map<string, { income: number; expenses: number }>();

  for (const entry of incomeEntries) {
    const month = (entry.paidDate || entry.dueDate).slice(0, 7);
    const item = seriesMap.get(month) || { income: 0, expenses: 0 };
    item.income += entry.amount;
    seriesMap.set(month, item);
  }
  for (const entry of expenseEntries) {
    const month = entry.date.slice(0, 7);
    const item = seriesMap.get(month) || { income: 0, expenses: 0 };
    item.expenses += entry.amount;
    seriesMap.set(month, item);
  }

  const series = Array.from(seriesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({
      month,
      income: v.income,
      expenses: v.expenses,
      net: v.income - v.expenses,
    }));

  const totals = series.reduce(
    (acc, p) => {
      acc.income += p.income;
      acc.expenses += p.expenses;
      acc.net += p.net;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 },
  );

  return { series, totals };
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = getRange(searchParams);
  const propertyId = searchParams.get('propertyId') || undefined;
  const data = computePnL({ from, to, propertyId });
  return Response.json(data);
}
