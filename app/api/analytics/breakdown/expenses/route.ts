import { NextResponse } from 'next/server';
import {
  seedIfEmpty,
  expenses,
  properties,
  isActiveProperty,
} from '../../../store';
import { mapExpenseCategory } from '../../../../../lib/expenses/categories';

function parseRange(search: URLSearchParams) {
  const now = new Date();
  const to = search.get('to');
  const from = search.get('from');
  const toDate = to ? new Date(to) : now;
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), 0, 1);
  if (fromDate > toDate) return { from: toDate, to: fromDate };
  return { from: fromDate, to: toDate };
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

  const itemsMap = new Map<string, number>();
  let total = 0;
  expenses.forEach((entry) => {
    if (!propertyIds.has(entry.propertyId)) return;
    if (!withinRange(entry.date)) return;
    total += entry.amount;
    const category = mapExpenseCategory(entry.category);
    itemsMap.set(category, (itemsMap.get(category) || 0) + entry.amount);
  });

  const items = Array.from(itemsMap.entries()).map(([category, value]) => ({
    category,
    value,
  }));

  return NextResponse.json({ total, items });
}
