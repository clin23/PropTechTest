import { calculatePnL } from '../helpers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId') || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const includeArchived = searchParams.get('includeArchived') === 'true';
  const data = calculatePnL({ propertyId, from, to, includeArchived });
  const rows = data.series
    .map(
      (s) =>
        `<tr><td>${s.month}</td><td>${s.income}</td><td>${s.expenses}</td><td>${s.net}</td></tr>`,
    )
    .join('');
  const html = `<table border='1'><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr>${rows}</table>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
