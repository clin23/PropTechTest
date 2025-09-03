import { properties, expenses } from '../../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id);
  const propertyExpenses = expenses.filter((e) => e.propertyId === params.id);
  const totalExpenses = propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const income = property ? property.rent * 12 : 0;
  const net = income - totalExpenses;
  const series = propertyExpenses.map((e) => ({ date: e.date, amount: e.amount }));
  return Response.json({ income, expenses: totalExpenses, net, series });
}
