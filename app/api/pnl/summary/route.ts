import { expenses, incomes, properties, isActiveProperty } from '../../store';
import type { PnlSummary, PnlPoint } from '../../../../types/pnl';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') === 'last12m' ? 'last12m' : 'last6m';
  const propertyId = searchParams.get('propertyId') || undefined;
  const includeArchived = searchParams.get('includeArchived') === 'true';

  const monthsBack = period === 'last12m' ? 11 : 5;
  const now = new Date();
  const months: string[] = [];
  for (let i = monthsBack; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthsSet = new Set(months);

  const allowedIds = propertyId
    ? [propertyId]
    : (includeArchived ? properties : properties.filter(isActiveProperty)).map((p) => p.id);

  const incomeByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();

  incomes.forEach((e) => {
    const month = e.date.slice(0, 7);
    if (monthsSet.has(month) && allowedIds.includes(e.propertyId)) {
      incomeByMonth.set(month, (incomeByMonth.get(month) || 0) + e.amount);
    }
  });

  expenses.forEach((e) => {
    const month = e.date.slice(0, 7);
    if (monthsSet.has(month) && allowedIds.includes(e.propertyId)) {
      expenseByMonth.set(month, (expenseByMonth.get(month) || 0) + e.amount);
    }
  });

  const series: PnlPoint[] = months.map((m) => {
    const income = incomeByMonth.get(m) || 0;
    const ex = expenseByMonth.get(m) || 0;
    return { month: m, income, expenses: ex, net: income - ex };
  });

  const totals = series.reduce(
    (acc, p) => {
      acc.income += p.income;
      acc.expenses += p.expenses;
      acc.net += p.net;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 },
  );

  const payload: PnlSummary = { period, series, totals };
  return Response.json(payload);
}
