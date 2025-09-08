import { computeRentMetrics } from '../../rent/route';
import { toCSV } from '../../../../../lib/export';
import { seedIfEmpty } from '../../../store';

export async function GET(req: Request) {
  seedIfEmpty();
  const url = new URL(req.url);
  const data = computeRentMetrics({
    from: url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined,
    to: url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined,
    propertyId: url.searchParams.get('propertyId') || undefined,
  });
  const rows = [
    ['Expected', 'Received', 'CollectionRate', 'ArrearsCount', 'ArrearsAmount'],
    [
      data.expected.toString(),
      data.received.toString(),
      data.collectionRate.toString(),
      data.arrearsCount.toString(),
      data.arrearsAmount.toString(),
    ],
  ];
  const csv = toCSV(rows);
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
}
