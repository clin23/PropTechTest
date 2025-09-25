import { NextResponse } from 'next/server';
import {
  seedIfEmpty,
  incomes,
  expenses,
  rentLedger,
  properties,
  isActiveProperty,
} from '../../../store';

function parseRange(search: URLSearchParams) {
  const now = new Date();
  const toParam = search.get('to');
  const fromParam = search.get('from');
  const to = toParam ? new Date(toParam) : now;
  const from = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), 0, 1);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new Error('Invalid date');
  }
  if (from > to) return { from: to, to: from };
  return { from, to };
}

function parseProperties(search: URLSearchParams, fallback: Set<string>) {
  const raw = search.get('propertyIds');
  if (!raw) return fallback;
  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id) => fallback.has(id));
  return new Set(ids.length ? ids : [...fallback]);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function ensureMaxBuckets(labels: string[]) {
  if (labels.length <= 400) return labels;
  const factor = Math.ceil(labels.length / 400);
  return labels.filter((_, idx) => idx % factor === 0);
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = parseRange(searchParams);
  const active = new Set(properties.filter(isActiveProperty).map((p) => p.id));
  const propertyIds = parseProperties(searchParams, active);

  const withinRange = (value: string) => {
    const d = new Date(value);
    return d >= from && d <= to;
  };

  const incomeByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();

  const pushIncome = (date: string, amount: number, propertyId: string) => {
    if (!propertyIds.has(propertyId)) return;
    if (!withinRange(date)) return;
    const key = monthKey(new Date(date));
    incomeByMonth.set(key, (incomeByMonth.get(key) || 0) + amount);
  };

  const pushExpense = (date: string, amount: number, propertyId: string) => {
    if (!propertyIds.has(propertyId)) return;
    if (!withinRange(date)) return;
    const key = monthKey(new Date(date));
    expenseByMonth.set(key, (expenseByMonth.get(key) || 0) + amount);
  };

  incomes.forEach((entry) => {
    pushIncome(entry.date, entry.amount, entry.propertyId);
  });

  rentLedger
    .filter((entry) => entry.status === 'paid')
    .forEach((entry) => {
      pushIncome(entry.paidDate || entry.dueDate, entry.amount, entry.propertyId);
    });

  expenses.forEach((entry) => {
    pushExpense(entry.date, entry.amount, entry.propertyId);
  });

  const labels = Array.from(
    new Set([...incomeByMonth.keys(), ...expenseByMonth.keys()]),
  ).sort();
  const filteredLabels = ensureMaxBuckets(labels);

  const buckets = filteredLabels.map((label) => {
    const income = incomeByMonth.get(label) || 0;
    const expense = expenseByMonth.get(label) || 0;
    return {
      label,
      income,
      expenses: expense,
      net: income - expense,
    };
  });

  return NextResponse.json({ buckets, granularity: 'month' as const });
}
