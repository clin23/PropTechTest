import { prisma } from '../../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const incomeRows = await prisma.mockData.findMany({ where: { type: 'income' } });
  const expenseRows = await prisma.mockData.findMany({ where: { type: 'expense' } });

  const propertyIncome = incomeRows
    .map((r) => r.data)
    .filter((i: any) => i.propertyId === params.id);
  const propertyExpenses = expenseRows
    .map((r) => r.data)
    .filter((e: any) => e.propertyId === params.id);

  const totalIncome = propertyIncome.reduce(
    (sum, i: any) => sum + (i.amount || 0),
    0
  );
  const totalExpenses = propertyExpenses.reduce(
    (sum, e: any) => sum + (e.amount || 0),
    0
  );
  const net = totalIncome - totalExpenses;

  const monthlyMap: Record<string, { income: number; expenses: number }> = {};
  for (const i of propertyIncome) {
    const month = i.date.slice(0, 7);
    monthlyMap[month] = monthlyMap[month] || { income: 0, expenses: 0 };
    monthlyMap[month].income += i.amount || 0;
  }
  for (const e of propertyExpenses) {
    const month = e.date.slice(0, 7);
    monthlyMap[month] = monthlyMap[month] || { income: 0, expenses: 0 };
    monthlyMap[month].expenses += e.amount || 0;
  }
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, m]) => ({ month, net: m.income - m.expenses }));

  return Response.json({ totalIncome, totalExpenses, net, monthly });
}
