import { prisma } from '../../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const property = await prisma.mockData.findUnique({ where: { id: params.id } });
  const expRows = await prisma.mockData.findMany({ where: { type: 'expense' } });
  const propertyExpenses = expRows.map((r) => r.data).filter((e: any) => e.propertyId === params.id);
  const totalExpenses = propertyExpenses.reduce((sum, e: any) => sum + (e.amount || 0), 0);
  const income = property ? (property.data as any).rent * 12 : 0;
  const net = income - totalExpenses;
  const series = propertyExpenses.map((e: any) => ({ date: e.date, amount: e.amount }));
  return Response.json({ income, expenses: totalExpenses, net, series });
}
