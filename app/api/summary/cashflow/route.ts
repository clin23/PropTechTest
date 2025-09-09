import { rentLedger, expenses, seedIfEmpty } from '../../store';

export async function GET() {
  seedIfEmpty();

  // Determine the most recent month that has either income or expense data
  const dates = [
    ...rentLedger
      .filter((r) => r.status === 'paid')
      .map((r) => r.paidDate || r.dueDate),
    ...expenses.map((e) => e.date),
  ].sort();
  const latest = dates[dates.length - 1] || new Date().toISOString();
  const month = latest.slice(0, 7); // YYYY-MM

  const monthIncome = rentLedger
    .filter(
      (r) =>
        r.status === 'paid' &&
        (r.paidDate || r.dueDate).startsWith(month)
    )
    .reduce((sum, r) => sum + r.amount, 0);

  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);

  return Response.json({
    monthIncome,
    monthExpenses,
    net: monthIncome - monthExpenses,
  });
}
