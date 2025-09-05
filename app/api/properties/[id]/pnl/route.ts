import { prisma } from '../../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const property = await prisma.mockData.findUnique({ where: { id: params.id } });
  const expRows = await prisma.mockData.findMany({ where: { type: 'expense' } });
  const propertyExpenses = expRows.map((r) => r.data).filter((e: any) => e.propertyId === params.id);
  const totalExpenses = propertyExpenses.reduce((sum, e: any) => sum + (e.amount || 0), 0);
  const monthlyIncome = property ? (property.data as any).rent : 0;
  const totalIncome = monthlyIncome * 12;
  const net = totalIncome - totalExpenses;
  const expenseByMonth: Record<string, number> = {};
  for (const e of propertyExpenses) {
    const month = (e.date as string).slice(0, 7);
    expenseByMonth[month] = (expenseByMonth[month] || 0) + (e.amount || 0);
  }
  const monthly = Object.entries(expenseByMonth).map(([month, exp]) => ({
    month,
    net: monthlyIncome - exp,
  }));
  return Response.json({ totalIncome, totalExpenses, net, monthly });
}
