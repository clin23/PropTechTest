import { expenses, properties, isActiveProperty } from '../../app/api/store';
import type { ExpenseBreakdown } from '../../types/analytics';
import { mapExpenseCategory } from '../expenses/categories';

export function computeExpenseBreakdown(params: {
  from?: Date;
  to?: Date;
  propertyId?: string;
}): ExpenseBreakdown {
  const { from, to, propertyId } = params;
  const fromDate = from || new Date('1970-01-01');
  const toDate = to || new Date('2100-01-01');
  const allowed = propertyId
    ? [propertyId]
    : properties.filter(isActiveProperty).map((p) => p.id);

  const filtered = expenses.filter(
    (e) =>
      allowed.includes(e.propertyId) &&
      new Date(e.date) >= fromDate &&
      new Date(e.date) <= toDate,
  );

  const map = new Map<string, number>();
  for (const e of filtered) {
    const category = mapExpenseCategory(e.category);
    map.set(category, (map.get(category) || 0) + e.amount);
  }
  const slices = Array.from(map.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
  const total = slices.reduce((s, x) => s + x.amount, 0);
  return { slices, total };
}
