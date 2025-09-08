import { computeExpenseBreakdown } from '../../expenses/route';
import { toCSV } from '../../../../../lib/export';
import { seedIfEmpty } from '../../../store';

export async function GET(req: Request) {
  seedIfEmpty();
  const url = new URL(req.url);
  const data = computeExpenseBreakdown({
    from: url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined,
    to: url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined,
    propertyId: url.searchParams.get('propertyId') || undefined,
  });
  const rows = [
    ['Category', 'Amount'],
    ...data.slices.map((s) => [s.category, s.amount.toString()]),
    ['Total', data.total.toString()],
  ];
  const csv = toCSV(rows);
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
}
