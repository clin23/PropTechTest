import { NextResponse } from 'next/server';
import {
  seedIfEmpty,
  incomes,
  expenses,
  rentLedger,
  properties,
  isActiveProperty,
} from '../../store';

function parseDate(value: string | null, fallback?: Date): Date | undefined {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function getDateRange(search: URLSearchParams) {
  const fromParam = search.get('from');
  const toParam = search.get('to');
  const now = new Date();
  const to = parseDate(toParam, now)!;
  const from = parseDate(fromParam, new Date(now.getFullYear(), 0, 1))!;
  if (from > to) {
    return { from: to, to: from };
  }
  return { from, to };
}

function getPropertyFilter(search: URLSearchParams) {
  const raw = search.get('propertyIds');
  if (!raw) return undefined;
  const ids = raw.split(',').map((v) => v.trim()).filter(Boolean);
  return ids.length ? new Set(ids) : undefined;
}

const DAY = 24 * 60 * 60 * 1000;

function differenceInDaysInclusive(from: Date, to: Date) {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY)) + 1;
}

function clampDate(date: Date | undefined, fallback: Date) {
  if (!date) return fallback;
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = getDateRange(searchParams);
  const propertyFilter = getPropertyFilter(searchParams);
  const activePropertyIds = new Set(
    properties.filter(isActiveProperty).map((p) => p.id),
  );

  const allowedPropertyIds = propertyFilter
    ? new Set([...propertyFilter].filter((id) => activePropertyIds.has(id)))
    : activePropertyIds;

  const withinRange = (date: string) => {
    const d = new Date(date);
    return d >= from && d <= to;
  };

  const incomeEntries = [
    ...incomes,
    ...rentLedger
      .filter((r) => r.status === 'paid')
      .map((r) => ({
        propertyId: r.propertyId,
        amount: r.amount,
        date: r.paidDate || r.dueDate,
      })),
  ].filter((entry) => {
    if (!allowedPropertyIds.has(entry.propertyId)) return false;
    return withinRange(entry.date);
  });

  const expenseEntries = expenses.filter((entry) => {
    if (!allowedPropertyIds.has(entry.propertyId)) return false;
    return withinRange(entry.date);
  });

  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
  const netCashflow = totalIncome - totalExpenses;

  const consideredProperties = properties.filter(
    (p) => allowedPropertyIds.has(p.id),
  );
  const totalPortfolioValue = consideredProperties.reduce(
    (sum, p) => sum + (p.value ?? 0),
    0,
  );
  const totalAnnualRent = consideredProperties.reduce(
    (sum, p) => sum + p.rent * 12,
    0,
  );
  const grossYield = totalPortfolioValue
    ? (totalAnnualRent / totalPortfolioValue) * 100
    : null;

  const totalDays = differenceInDaysInclusive(from, to);
  const portfolioTotalDays = totalDays * consideredProperties.length;

  let occupiedDays = 0;
  for (const property of consideredProperties) {
    const leaseStart = clampDate(
      property.leaseStart ? new Date(property.leaseStart) : undefined,
      from,
    );
    const leaseEnd = clampDate(
      property.leaseEnd ? new Date(property.leaseEnd) : undefined,
      to,
    );
    if (!property.leaseStart && !property.leaseEnd) continue;
    const start = leaseStart > from ? leaseStart : from;
    const end = leaseEnd < to ? leaseEnd : to;
    if (end < start) continue;
    occupiedDays += differenceInDaysInclusive(start, end);
  }
  const occupancyRate =
    portfolioTotalDays > 0 ? (occupiedDays / portfolioTotalDays) * 100 : null;

  const rentEntries = rentLedger.filter((entry) => {
    if (!allowedPropertyIds.has(entry.propertyId)) return false;
    return withinRange(entry.dueDate);
  });
  const onTimeTotal = rentEntries.length;
  const onTimeCount = rentEntries.filter((entry) => {
    if (entry.status !== 'paid') return false;
    const paidDate = entry.paidDate ? new Date(entry.paidDate) : undefined;
    const dueDate = new Date(entry.dueDate);
    return paidDate ? paidDate <= dueDate : true;
  }).length;
  const onTimeCollection = onTimeTotal
    ? (onTimeCount / onTimeTotal) * 100
    : null;

  return NextResponse.json({
    netCashflow,
    grossYield,
    occupancyRate,
    onTimeCollection,
  });
}
