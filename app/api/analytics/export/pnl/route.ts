import { computePnL } from '../../pnl/route';
import { toCSV } from '../../../../../lib/export';
import { seedIfEmpty } from '../../../store';

export async function GET(req: Request) {
  seedIfEmpty();
  const url = new URL(req.url);
  const data = computePnL({
    from: url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined,
    to: url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined,
    propertyId: url.searchParams.get('propertyId') || undefined,
  });
  const rows = [
    ['Month', 'Income', 'Expenses', 'Net'],
    ...data.series.map((p) => [p.month, p.income.toString(), p.expenses.toString(), p.net.toString()]),
    ['Totals', data.totals.income.toString(), data.totals.expenses.toString(), data.totals.net.toString()],
  ];
  const csv = toCSV(rows);
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv' },
  });
}
