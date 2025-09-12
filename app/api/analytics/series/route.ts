import { NextResponse } from 'next/server';
import { incomes, expenses, rentLedger, properties } from '../../store';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../../../lib/categories';

function monthKey(d: Date) {
  return d.toISOString().slice(0, 7);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = new Date(searchParams.get('from') ?? '2000-01-01');
  const to = new Date(searchParams.get('to') ?? '2100-01-01');
  const metric = searchParams.get('metric') ?? 'net';
  const filters = JSON.parse(searchParams.get('filters') ?? '{}');

  const propertyIds: string[] = filters.properties ?? [];
  const incomeTypes: string[] = filters.incomeTypes ?? [];
  const expenseTypes: string[] = filters.expenseTypes ?? [];

  const expand = (types: string[], groups: Record<string, readonly string[]>) => {
    const expanded: string[] = [];
    for (const t of types) {
      const groupKey = Object.keys(groups).find((key) => {
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        return label === t;
      });
      if (groupKey) expanded.push(...(groups[groupKey] || []));
      else expanded.push(t);
    }
    return new Set(expanded);
  };

  const incomeTypeSet = expand(incomeTypes, INCOME_CATEGORIES);
  const expenseTypeSet = expand(expenseTypes, EXPENSE_CATEGORIES);

  const incomeEntries = [
    ...incomes.filter((i) => i.category !== 'Base rent'),
    ...rentLedger
      .filter((r) => r.status === 'paid')
      .map((r) => ({
        propertyId: r.propertyId,
        date: r.paidDate ?? r.dueDate,
        category: 'Base rent',
        amount: r.amount,
      })),
  ].filter((i) => {
    if (propertyIds.length && !propertyIds.includes(i.propertyId)) return false;
    if (incomeTypeSet.size && !incomeTypeSet.has(i.category)) return false;
    return true;
  });

  const incomeByMonth = new Map<string, number>();
  const incomeItemsByMonth = new Map<string, any[]>();
  for (const i of incomeEntries) {
    const d = new Date(i.date);
    if (d < from || d > to) continue;
    const key = monthKey(d);
    incomeByMonth.set(key, (incomeByMonth.get(key) || 0) + i.amount);
    const prop = properties.find((p) => p.id === i.propertyId);
    const arr = incomeItemsByMonth.get(key) || [];
    arr.push({ amount: i.amount, propertyId: i.propertyId, property: prop?.address });
    incomeItemsByMonth.set(key, arr);
  }

  const expenseEntries = expenses.filter((e) => {
    if (propertyIds.length && !propertyIds.includes(e.propertyId)) return false;
    if (expenseTypeSet.size && !expenseTypeSet.has(e.category)) return false;
    return true;
  });
  const expenseByMonth = new Map<string, number>();
  const expenseItemsByMonth = new Map<string, any[]>();
  for (const e of expenseEntries) {
    const d = new Date(e.date);
    if (d < from || d > to) continue;
    const key = monthKey(d);
    expenseByMonth.set(key, (expenseByMonth.get(key) || 0) + e.amount);
    const prop = properties.find((p) => p.id === e.propertyId);
    const arr = expenseItemsByMonth.get(key) || [];
    arr.push({ amount: e.amount, vendor: e.vendor, gst: e.gst, category: e.category, propertyId: e.propertyId, property: prop?.address });
    expenseItemsByMonth.set(key, arr);
  }

  const labels = Array.from(new Set([...incomeByMonth.keys(), ...expenseByMonth.keys()])).sort();
  const buckets = labels.map((label) => {
    const income = incomeByMonth.get(label) || 0;
    const expenses = expenseByMonth.get(label) || 0;
    const net = income - expenses;
    return {
      label,
      income,
      expenses,
      net,
      incomeItems: incomeItemsByMonth.get(label) || [],
      expenseItems: expenseItemsByMonth.get(label) || [],
    };
  });
  const total = buckets.reduce((sum, b) => sum + b[metric as 'income' | 'expenses' | 'net'], 0);
  return NextResponse.json({ total, buckets });
}
