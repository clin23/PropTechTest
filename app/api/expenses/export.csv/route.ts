import { expenses } from '../../store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let results = expenses;
  const propertyId = searchParams.get('propertyId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (propertyId) {
    results = results.filter((e) => e.propertyId === propertyId);
  }
  if (from) {
    results = results.filter((e) => new Date(e.date) >= new Date(from));
  }
  if (to) {
    results = results.filter((e) => new Date(e.date) <= new Date(to));
  }

  const rows = [
    ['Date', 'Category', 'Vendor', 'Amount', 'GST', 'Notes'],
    ...results.map((e) => [
      e.date,
      e.category,
      e.vendor,
      e.amount.toString(),
      e.gst.toString(),
      e.notes ?? '',
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
}
