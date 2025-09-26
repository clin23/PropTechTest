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

  const totals = new Map<string, { income: number; expense: number }>();
  const ensure = (id: string) => {
    if (!totals.has(id)) {
      totals.set(id, { income: 0, expense: 0 });
    }
    return totals.get(id)!;
  };

  incomes.forEach((entry) => {
    if (!propertyIds.has(entry.propertyId)) return;
    if (!withinRange(entry.date)) return;
    ensure(entry.propertyId).income += entry.amount;
  });

  rentLedger
    .filter((entry) => entry.status === 'paid')
    .forEach((entry) => {
      if (!propertyIds.has(entry.propertyId)) return;
      const date = entry.paidDate || entry.dueDate;
      if (!withinRange(date)) return;
      ensure(entry.propertyId).income += entry.amount;
    });

  expenses.forEach((entry) => {
    if (!propertyIds.has(entry.propertyId)) return;
    if (!withinRange(entry.date)) return;
    ensure(entry.propertyId).expense += entry.amount;
  });

  const items = Array.from(propertyIds).map((propertyId) => {
    const totalsForProperty = totals.get(propertyId) ?? { income: 0, expense: 0 };
    const property = properties.find((p) => p.id === propertyId);
    return {
      propertyId,
      propertyLabel: property?.address ?? `Property ${propertyId}`,
      net: totalsForProperty.income - totalsForProperty.expense,
    };
  });

  return NextResponse.json({ items });
}
