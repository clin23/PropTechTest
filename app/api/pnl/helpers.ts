import { expenses, rentLedger } from '../store';

interface Params {
  from?: string;
  to?: string;
  propertyId?: string;
}

export function calculatePnL({ from, to, propertyId }: Params) {
  const fromDate = from ? new Date(from) : new Date('1970-01-01');
  const toDate = to ? new Date(to) : new Date('2100-01-01');

  const incomeEntries = rentLedger.filter(
    (e) =>
      (!propertyId || e.propertyId === propertyId) &&
      e.status === 'paid' &&
      new Date(e.dueDate) >= fromDate &&
      new Date(e.dueDate) <= toDate,
  );

  const expenseEntries = expenses.filter(
    (e) =>
      (!propertyId || e.propertyId === propertyId) &&
      new Date(e.date) >= fromDate &&
      new Date(e.date) <= toDate,
  );

  const income = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const expensesTotal = expenseEntries.reduce((sum, e) => sum + e.amount, 0);

  const seriesMap = new Map<string, { income: number; expenses: number }>();

  for (const entry of incomeEntries) {
    const month = entry.dueDate.slice(0, 7);
    const item = seriesMap.get(month) || { income: 0, expenses: 0 };
    item.income += entry.amount;
    seriesMap.set(month, item);
  }

  for (const entry of expenseEntries) {
    const month = entry.date.slice(0, 7);
    const item = seriesMap.get(month) || { income: 0, expenses: 0 };
    item.expenses += entry.amount;
    seriesMap.set(month, item);
  }

  const series = Array.from(seriesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({
      month,
      income: v.income,
      expenses: v.expenses,
      net: v.income - v.expenses,
    }));

  return { income, expenses: expensesTotal, net: income - expensesTotal, series };
}
