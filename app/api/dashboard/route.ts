import { NextResponse } from 'next/server';
import type {
  DashboardDTO,
  TimeSeriesPoint,
  IncomeByPropertySlice,
  ExpenseByCategorySlice,
  PropertyCardData,
  RentDue,
} from '../../../types/dashboard';
import {
  properties,
  expenses,
  incomes,
  rentLedger,
  reminders,
  listTasks,
  isActiveProperty,
  seedIfEmpty,
} from '../store';

const toCents = (value: number) => Math.round(value * 100);

export async function GET(req: Request) {
  seedIfEmpty();

  const url = new URL(req.url);
  const from = url.searchParams.get('from') ?? '1970-01-01';
  const to = url.searchParams.get('to') ?? new Date().toISOString().split('T')[0];

  const inRange = (date: string, start: string, end: string) =>
    date >= start && date <= end;

  const incomeEntries = [
    ...rentLedger
      .filter((r) => r.status === 'paid')
      .map((r) => ({
        date: r.paidDate || r.dueDate,
        propertyId: r.propertyId,
        amount: r.amount,
      })),
    ...incomes.map((i) => ({
      date: i.date,
      propertyId: i.propertyId,
      amount: i.amount,
    })),
  ];

  const expenseEntries = expenses.map((e) => ({
    date: e.date,
    propertyId: e.propertyId,
    category: e.category,
    amount: e.amount,
  }));

  const yearStart = to.slice(0, 4) + '-01-01';
  const monthStart = to.slice(0, 7) + '-01';

  const sumIncome = (start: string, end: string) =>
    incomeEntries
      .filter((e) => inRange(e.date, start, end))
      .reduce((s, e) => s + toCents(e.amount), 0);
  const sumExpense = (start: string, end: string) =>
    expenseEntries
      .filter((e) => inRange(e.date, start, end))
      .reduce((s, e) => s + toCents(e.amount), 0);

  const ytdIncome = sumIncome(yearStart, to);
  const ytdExpense = sumExpense(yearStart, to);
  const mtdIncome = sumIncome(monthStart, to);
  const mtdExpense = sumExpense(monthStart, to);

  const points: TimeSeriesPoint[] = [];
  for (
    let d = new Date(from + 'T00:00:00');
    d <= new Date(to + 'T00:00:00');
    d.setDate(d.getDate() + 1)
  ) {
    const date = d.toISOString().split('T')[0];
    const cashInCents = incomeEntries
      .filter((e) => e.date === date)
      .reduce((s, e) => s + toCents(e.amount), 0);
    const cashOutCents = expenseEntries
      .filter((e) => e.date === date)
      .reduce((s, e) => s + toCents(e.amount), 0);
    points.push({
      date,
      cashInCents,
      cashOutCents,
      netCents: cashInCents - cashOutCents,
    });
  }

  const incomeByPropertyMap: Record<string, number> = {};
  incomeEntries
    .filter((e) => inRange(e.date, from, to))
    .forEach((e) => {
      incomeByPropertyMap[e.propertyId] =
        (incomeByPropertyMap[e.propertyId] ?? 0) + toCents(e.amount);
    });
  const incomeByProperty: IncomeByPropertySlice[] = Object.entries(
    incomeByPropertyMap
  ).map(([propertyId, incomeCents]) => ({
    propertyId,
    propertyName:
      properties.find((p) => p.id === propertyId)?.address || propertyId,
    incomeCents,
  }));

  const mapCategory = (
    cat: string
  ): ExpenseByCategorySlice['category'] => {
    const c = cat.toLowerCase();
    if (c.includes('insurance')) return 'Insurance';
    if (c.includes('rate')) return 'Rates';
    if (c.includes('utility') || c.includes('water') || c.includes('electric'))
      return 'Utilities';
    if (
      c.includes('maint') ||
      c.includes('repair') ||
      c.includes('plumb') ||
      c.includes('electrical') ||
      c.includes('garden') ||
      c.includes('landscaping') ||
      c.includes('clean')
    )
      return 'Maintenance';
    if (c.includes('strata')) return 'Strata';
    if (c.includes('mortgage')) return 'Mortgage Interest';
    if (c.includes('manage')) return 'Property Mgmt';
    return 'Other';
  };

  const expenseByCategoryMap: Record<string, number> = {};
  expenseEntries
    .filter((e) => inRange(e.date, from, to))
    .forEach((e) => {
      const cat = mapCategory(e.category);
      expenseByCategoryMap[cat] =
        (expenseByCategoryMap[cat] ?? 0) + toCents(e.amount);
    });
  const expensesByCategory: ExpenseByCategorySlice[] = Object.entries(
    expenseByCategoryMap
  ).map(([category, amountCents]) => ({
    category: category as ExpenseByCategorySlice['category'],
    amountCents,
  }));

  const today = new Date().toISOString().split('T')[0];
  const activeProps = properties.filter(isActiveProperty);
  const propertyCards: PropertyCardData[] = activeProps.map((p) => {
    const rentEntries = rentLedger
      .filter((r) => r.propertyId === p.id)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const nextRent = rentEntries.find(
      (r) => r.status !== 'paid' || r.dueDate >= today
    );

    let rentDue: RentDue;
    if (nextRent) {
      let status: RentDue['status'];
      if (nextRent.status === 'paid') status = 'Paid';
      else if (nextRent.dueDate < today) status = 'Overdue';
      else if (nextRent.dueDate === today) status = 'Due';
      else status = 'Upcoming';
      rentDue = {
        nextDueDate: nextRent.dueDate,
        amountCents: toCents(nextRent.amount),
        status,
      };
    } else {
      rentDue = { nextDueDate: '', amountCents: 0, status: 'Paid' };
    }

    const alerts = reminders
      .filter((r) => r.propertyId === p.id)
      .map((r) => ({
        id: r.id,
        label: r.title,
        date: r.dueDate,
        severity: r.severity,
      }));

    const taskItems = listTasks({ propertyId: p.id })
      .filter((t) => t.status !== 'done')
      .map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status as PropertyCardData['tasks'][number]['status'],
        dueDate: t.dueDate,
        priority:
          t.priority === 'normal'
            ? 'med'
            : (t.priority as PropertyCardData['tasks'][number]['priority']),
      }));

    return {
      propertyId: p.id,
      name: p.address,
      rentDue,
      alerts,
      tasks: taskItems,
    };
  });

  const data: DashboardDTO = {
    portfolio: {
      propertiesCount: activeProps.length,
      occupiedCount: activeProps.filter((p) => !!p.tenant).length,
      vacancyCount: activeProps.filter((p) => !p.tenant).length,
    },
    cashflow: {
      ytdNet: { amountCents: ytdIncome - ytdExpense, currency: 'AUD' },
      mtdNet: { amountCents: mtdIncome - mtdExpense, currency: 'AUD' },
    },
    lineSeries: { points },
    incomeByProperty,
    expensesByCategory,
    properties: propertyCards,
  };

  return NextResponse.json(data);
}

