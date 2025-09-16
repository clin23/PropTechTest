import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import type {
  DashboardDTO,
  TimeSeriesPoint,
  IncomeByPropertySlice,
  ExpenseByCategorySlice,
  PropertyCardData,
  RentDue,
  AlertItem,
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
import type { TaskDto } from '../../../types/tasks';

const toCents = (value: number) => Math.round(value * 100);

type DashboardTask = PropertyCardData['tasks'][number];

const normalizeTaskStatus = (
  status?: TaskDto['status']
): DashboardTask['status'] => {
  const value = (status ?? '').toLowerCase();
  if (value === 'in_progress' || value === 'in-progress' || value === 'in progress') {
    return 'in_progress';
  }
  if (value === 'blocked') return 'blocked';
  if (value === 'done' || value === 'completed' || value === 'complete') return 'done';
  return 'todo';
};

const normalizeTaskPriority = (
  priority?: TaskDto['priority']
): DashboardTask['priority'] => {
  const value = (priority ?? '').toLowerCase();
  if (value === 'high') return 'high';
  if (value === 'normal' || value === 'medium' || value === 'med') return 'med';
  return 'low';
};

const mapTaskToDashboardTask = (
  task: TaskDto
): DashboardTask => ({
  id: task.id,
  title: task.title,
  status: normalizeTaskStatus(task.status),
  dueDate: task.dueDate,
  priority: normalizeTaskPriority(task.priority),
});

export async function GET(req: Request) {
  seedIfEmpty();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get('from') ?? '1970-01-01';
  const to = url.searchParams.get('to') ?? new Date().toISOString().split('T')[0];

  const [propertyRows, incomeRows, expenseRows, rentRows, reminderRows, taskRows] =
    await Promise.all([
      prisma.mockData.findMany({ where: { type: 'property' } }),
      prisma.mockData.findMany({ where: { type: 'income' } }),
      prisma.mockData.findMany({ where: { type: 'expense' } }),
      prisma.mockData
        .findMany({ where: { type: 'rentLedger' } })
        .then(async (rows: any[]) => {
          if (rows.length > 0) return rows;
          return prisma.mockData.findMany({ where: { type: 'rent' } });
        }),
      prisma.mockData.findMany({ where: { type: 'reminder' } }),
      prisma.mockData.findMany({ where: { type: 'task' } }),
    ]);

  const properties = recordData<Property>(propertyRows);
  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const activeProps = properties.filter(isActiveProperty);

  const incomes = recordData<Income>(incomeRows).filter(
    (income) => !!income.propertyId
  );
  const expenseEntries = recordData<Expense>(expenseRows).filter(
    (expense) => !!expense.propertyId
  );
  const rentLedgerEntries = recordData<RentEntry>(rentRows).filter(
    (entry) => !!entry.propertyId
  );
  const reminders = recordData<Reminder>(reminderRows);
  const tasks = recordData<TaskDto>(taskRows);

  const inRange = (date: string, start: string, end: string) =>
    date >= start && date <= end;

  const incomeEntries = [
    ...rentLedgerEntries
      .filter((r) => r.status === 'paid')
      .map((r) => ({
        date: r.paidDate || r.dueDate,
        propertyId: r.propertyId,
        amount: Number(r.amount) || 0,
      })),
    ...incomes.map((i) => ({
      date: i.date,
      propertyId: i.propertyId,
      amount: Number(i.amount) || 0,
    })),
  ];

  const expensesWithCategory = expenseEntries.map((e) => ({
    date: e.date,
    propertyId: e.propertyId,
    category: e.category,
    amount: Number(e.amount) || 0,
  }));

  const yearStart = to.slice(0, 4) + '-01-01';
  const monthStart = to.slice(0, 7) + '-01';

  const sumIncome = (start: string, end: string) =>
    incomeEntries
      .filter((e) => inRange(e.date, start, end))
      .reduce((s, e) => s + toCents(e.amount), 0);
  const sumExpense = (start: string, end: string) =>
    expensesWithCategory
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
    const cashOutCents = expensesWithCategory
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
    propertyName: getPropertyName(propertyMap.get(propertyId), propertyId),
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
  expensesWithCategory
    .filter((e) => inRange(e.date, from, to))
    .forEach((e) => {
      const cat = mapCategory(e.category || '');
      expenseByCategoryMap[cat] =
        (expenseByCategoryMap[cat] ?? 0) + toCents(e.amount);
    });
  const expensesByCategory: ExpenseByCategorySlice[] = Object.entries(
    expenseByCategoryMap
  ).map(([category, amountCents]) => ({
    category: category as ExpenseByCategorySlice['category'],
    amountCents,
  }));

  const normalizeTaskStatus = (
    status?: string
  ): PropertyCardData['tasks'][number]['status'] => {
    const value = (status ?? '').toLowerCase();
    if (value === 'in_progress' || value === 'in-progress' || value === 'in progress') {
      return 'in_progress';
    }
    if (value === 'blocked') return 'blocked';
    if (value === 'done' || value === 'completed' || value === 'complete') return 'done';
    return 'todo';
  };

  const normalizeTaskPriority = (
    priority?: string
  ): PropertyCardData['tasks'][number]['priority'] => {
    const value = (priority ?? '').toLowerCase();
    if (value === 'high') return 'high';
    if (value === 'normal' || value === 'medium' || value === 'med') return 'med';
    return 'low';
  };

  const today = new Date().toISOString().split('T')[0];
  const activeProps = properties.filter(storeIsActiveProperty);
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
        amountCents: toCents(Number(nextRent.amount) || 0),
        status,
      };
    } else {
      rentDue = { nextDueDate: '', amountCents: 0, status: 'Paid' };
    }

    const alerts = reminders
      .filter((r) => r.propertyId === property.id)
      .map((r) => ({
        id: r.id,
        label: (r as any).title || (r as any).message || '',
        date: r.dueDate,
        severity: (r.severity || 'low') as AlertItem['severity'],
      }));

    const taskItems = listTasks({ propertyId: p.id })
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: normalizeTaskStatus(task.status),
        dueDate: task.dueDate,
        priority: normalizeTaskPriority(task.priority),
      }))
      .filter((task) => task.status !== 'done')
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });

    return {
      propertyId: property.id,
      name: getPropertyName(property, property.id),
      rentDue,
      alerts,
      tasks: taskItems,
    };
  });

  const data: DashboardDTO = {
    portfolio: {
      propertiesCount: activeProps.length,
      occupiedCount: activeProps.filter((p) => !!(p as any).tenant).length,
      vacancyCount: activeProps.filter((p) => !(p as any).tenant).length,
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

