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
import type { TaskDto } from '../../../types/tasks';

const toCents = (value: number) => Math.round(value * 100);

const normalizeTaskStatus = (
  status?: TaskDto['status']
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
  priority?: TaskDto['priority']
): PropertyCardData['tasks'][number]['priority'] => {
  const value = (priority ?? '').toLowerCase();
  if (value === 'high') return 'high';
  if (value === 'normal' || value === 'medium' || value === 'med') return 'med';
  return 'low';
};

const toDashboardTask = (
  task: TaskDto
): PropertyCardData['tasks'][number] => ({
  id: task.id,
  title: task.title,
  status: normalizeTaskStatus(task.status),
  dueDate: task.dueDate,
  priority: normalizeTaskPriority(task.priority),
});

const sortByDueDate = (
  a: PropertyCardData['tasks'][number],
  b: PropertyCardData['tasks'][number]
) => {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate.localeCompare(b.dueDate);
};

const listDashboardTasks = (propertyId: string) =>
  listTasks({ propertyId })
    .map(toDashboardTask)
    .filter((task) => task.status !== 'done')
    .sort(sortByDueDate);

export async function GET(req: Request) {
  seedIfEmpty();

  const url = new URL(req.url);
  const from = url.searchParams.get('from') ?? '1970-01-01';
  const to = url.searchParams.get('to') ?? new Date().toISOString().split('T')[0];

  const activeProperties = properties.filter(isActiveProperty);
  const activePropertyIds = new Set(activeProperties.map((property) => property.id));
  const propertyById = new Map(properties.map((property) => [property.id, property]));

  const inRange = (date: string, start: string, end: string) =>
    date >= start && date <= end;

  const incomeEntries = [
    ...rentLedger
      .filter((entry) => entry.status === 'paid' && activePropertyIds.has(entry.propertyId))
      .map((entry) => ({
        date: entry.paidDate || entry.dueDate,
        propertyId: entry.propertyId,
        amount: entry.amount,
      })),
    ...incomes
      .filter((income) => activePropertyIds.has(income.propertyId))
      .map((income) => ({
        date: income.date,
        propertyId: income.propertyId,
        amount: income.amount,
      })),
  ];

  const expenseEntries = expenses
    .filter((expense) => activePropertyIds.has(expense.propertyId))
    .map((expense) => ({
      date: expense.date,
      propertyId: expense.propertyId,
      category: expense.category,
      amount: expense.amount,
    }));

  const yearStart = to.slice(0, 4) + '-01-01';
  const monthStart = to.slice(0, 7) + '-01';

  const sumIncome = (start: string, end: string) =>
    incomeEntries
      .filter((entry) => inRange(entry.date, start, end))
      .reduce((sum, entry) => sum + toCents(entry.amount), 0);
  const sumExpense = (start: string, end: string) =>
    expenseEntries
      .filter((entry) => inRange(entry.date, start, end))
      .reduce((sum, entry) => sum + toCents(entry.amount), 0);

  const ytdIncome = sumIncome(yearStart, to);
  const ytdExpense = sumExpense(yearStart, to);
  const mtdIncome = sumIncome(monthStart, to);
  const mtdExpense = sumExpense(monthStart, to);

  const points: TimeSeriesPoint[] = [];
  for (
    let day = new Date(from + 'T00:00:00');
    day <= new Date(to + 'T00:00:00');
    day.setDate(day.getDate() + 1)
  ) {
    const date = day.toISOString().split('T')[0];
    const cashInCents = incomeEntries
      .filter((entry) => entry.date === date)
      .reduce((sum, entry) => sum + toCents(entry.amount), 0);
    const cashOutCents = expenseEntries
      .filter((entry) => entry.date === date)
      .reduce((sum, entry) => sum + toCents(entry.amount), 0);
    points.push({
      date,
      cashInCents,
      cashOutCents,
      netCents: cashInCents - cashOutCents,
    });
  }

  const incomeByPropertyTotals: Record<string, number> = {};
  incomeEntries
    .filter((entry) => inRange(entry.date, from, to))
    .forEach((entry) => {
      incomeByPropertyTotals[entry.propertyId] =
        (incomeByPropertyTotals[entry.propertyId] ?? 0) + toCents(entry.amount);
    });
  const incomeByProperty: IncomeByPropertySlice[] = Object.entries(
    incomeByPropertyTotals
  ).map(([propertyId, incomeCents]) => ({
    propertyId,
    propertyName:
      propertyById.get(propertyId)?.address || propertyId,
    incomeCents,
  }));

  const mapCategory = (
    cat: string
  ): ExpenseByCategorySlice['category'] => {
    const lower = cat.toLowerCase();
    if (lower.includes('insurance')) return 'Insurance';
    if (lower.includes('rate')) return 'Rates';
    if (lower.includes('utility') || lower.includes('water') || lower.includes('electric'))
      return 'Utilities';
    if (
      lower.includes('maint') ||
      lower.includes('repair') ||
      lower.includes('plumb') ||
      lower.includes('electrical') ||
      lower.includes('garden') ||
      lower.includes('landscaping') ||
      lower.includes('clean')
    )
      return 'Maintenance';
    if (lower.includes('strata')) return 'Strata';
    if (lower.includes('mortgage')) return 'Mortgage Interest';
    if (lower.includes('manage')) return 'Property Mgmt';
    return 'Other';
  };

  const expenseByCategoryTotals: Record<string, number> = {};
  expenseEntries
    .filter((entry) => inRange(entry.date, from, to))
    .forEach((entry) => {
      const category = mapCategory(entry.category || '');
      expenseByCategoryTotals[category] =
        (expenseByCategoryTotals[category] ?? 0) + toCents(entry.amount);
    });
  const expensesByCategory: ExpenseByCategorySlice[] = Object.entries(
    expenseByCategoryTotals
  ).map(([category, amountCents]) => ({
    category: category as ExpenseByCategorySlice['category'],
    amountCents,
  }));

  const today = new Date().toISOString().split('T')[0];
  const propertyCards: PropertyCardData[] = activeProperties.map((property) => {
    const rentEntries = rentLedger
      .filter((entry) => entry.propertyId === property.id)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const nextRent = rentEntries.find(
      (entry) => entry.status !== 'paid' || entry.dueDate >= today
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
      .filter((reminder) => reminder.propertyId === property.id)
      .map((reminder) => ({
        id: reminder.id,
        label: reminder.title,
        date: reminder.dueDate,
        severity: reminder.severity,
      }));

    const tasks = listDashboardTasks(property.id);

    return {
      propertyId: property.id,
      name: property.address,
      rentDue,
      alerts,
      tasks,
    };
  });

  const data: DashboardDTO = {
    portfolio: {
      propertiesCount: activeProperties.length,
      occupiedCount: activeProperties.filter((property) => !!property.tenant).length,
      vacancyCount: activeProperties.filter((property) => !property.tenant).length,
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

