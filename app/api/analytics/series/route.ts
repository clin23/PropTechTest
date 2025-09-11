import { NextResponse } from 'next/server';
import { incomes, expenses, rentLedger } from '../../store';

function monthKey(d: Date) {
  return d.toISOString().slice(0, 7);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = new Date(searchParams.get('from') ?? '2000-01-01');
  const to = new Date(searchParams.get('to') ?? '2100-01-01');
  const metric = searchParams.get('metric') ?? 'net';

  const incomeEntries = [
    ...incomes,
    ...rentLedger
      .filter((r) => r.status === 'paid')
      .map((r) => ({
        propertyId: r.propertyId,
        date: r.paidDate ?? r.dueDate,
        category: 'Base rent',
        amount: r.amount,
      })),
  ];

  const incomeByMonth = new Map<string, number>();
  for (const i of incomeEntries) {
    const d = new Date(i.date);
    if (d < from || d > to) continue;
    const key = monthKey(d);
    incomeByMonth.set(key, (incomeByMonth.get(key) || 0) + i.amount);
  }

  const expenseByMonth = new Map<string, number>();
  for (const e of expenses) {
    const d = new Date(e.date);
    if (d < from || d > to) continue;
    const key = monthKey(d);
    expenseByMonth.set(key, (expenseByMonth.get(key) || 0) + e.amount);
  }

  const labels = Array.from(new Set([...incomeByMonth.keys(), ...expenseByMonth.keys()])).sort();
  const buckets = labels.map((label) => {
    const income = incomeByMonth.get(label) || 0;
    const expenses = expenseByMonth.get(label) || 0;
    const net = income - expenses;
    return { label, income, expenses, net };
  });
  const total = buckets.reduce((sum, b) => sum + b[metric as 'income' | 'expenses' | 'net'], 0);
  return NextResponse.json({ total, buckets });
}
