import { prisma } from '../../../../../../lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const incomeRows = await prisma.mockData.findMany({ where: { type: 'income' } });
  const expenseRows = await prisma.mockData.findMany({ where: { type: 'expense' } });

  let incomes = incomeRows.map((r: any) => r.data).filter((i: any) => i.propertyId === params.id);
  let expenses = expenseRows.map((r: any) => r.data).filter((e: any) => e.propertyId === params.id);

  if (from) {
    incomes = incomes.filter((i: any) => i.date >= from);
    expenses = expenses.filter((e: any) => e.date >= from);
  }
  if (to) {
    incomes = incomes.filter((i: any) => i.date <= to);
    expenses = expenses.filter((e: any) => e.date <= to);
  }

  const income = incomes.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
  const expensesTotal = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  const net = income - expensesTotal;

  const monthlyMap: Record<string, { income: number; expenses: number }> = {};
  for (const i of incomes) {
    const month = i.date.slice(0, 7);
    monthlyMap[month] = monthlyMap[month] || { income: 0, expenses: 0 };
    monthlyMap[month].income += i.amount || 0;
  }
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    monthlyMap[month] = monthlyMap[month] || { income: 0, expenses: 0 };
    monthlyMap[month].expenses += e.amount || 0;
  }

  const buckets = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, m]) => ({ month, income: m.income, expenses: m.expenses, net: m.income - m.expenses }));

  return Response.json({ income, expenses: expensesTotal, net, buckets });
}
