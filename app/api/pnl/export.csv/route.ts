import { calculatePnL } from '../helpers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId') || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const data = calculatePnL({ propertyId, from, to });
  const rows = [
    ['Month', 'Income', 'Expenses', 'Net'],
    ...data.series.map((s) => [
      s.month,
      s.income.toString(),
      s.expenses.toString(),
      s.net.toString(),
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv' },
  });
}
