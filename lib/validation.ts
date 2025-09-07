import { z } from 'zod';
import { EXPENSE_CATEGORY_OPTIONS, INCOME_CATEGORY_OPTIONS } from './categories';

export const inspectionSchema = z.object({
  propertyId: z.string(),
  type: z.string(),
  scheduledAt: z.string(),
  templateId: z.string().optional(),
});

export const zExpenseCategory = z.enum(
  [...EXPENSE_CATEGORY_OPTIONS] as [string, ...string[]]
);
export const zIncomeCategory = z.enum(
  [...INCOME_CATEGORY_OPTIONS] as [string, ...string[]]
);

export const zExpense = z.object({
  id: z.string().optional(),
  propertyId: z.string(),
  date: z.string(),
  category: zExpenseCategory,
  vendor: z.string().optional(),
  amount: z.number().nonnegative(),
  gst: z.number().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  label: z.string().optional(),
});

export const zIncome = z.object({
  id: z.string().optional(),
  propertyId: z.string(),
  tenantId: z.string().optional(),
  date: z.string(),
  category: zIncomeCategory,
  amount: z.number().nonnegative(),
  notes: z.string().optional(),
  label: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string(),
  tags: z.array(z.string()).default([]),
});

export const zPnlPoint = z.object({
  month: z.string(),
  income: z.number(),
  expenses: z.number(),
  net: z.number(),
});

export const zPnlSummary = z.object({
  period: z.enum(['last6m', 'last12m']),
  series: z.array(zPnlPoint),
  totals: z.object({
    income: z.number(),
    expenses: z.number(),
    net: z.number(),
  }),
});

export const zReminder = z.object({
  id: z.string(),
  propertyId: z.string(),
  propertyAddress: z.string(),
  type: z.enum([
    'lease_expiry',
    'rent_review',
    'insurance_renewal',
    'inspection_due',
    'custom',
  ]),
  title: z.string(),
  dueDate: z.string(),
  severity: z.enum(['low', 'med', 'high']),
});

export const zReminders = z.array(zReminder);

export type InspectionInput = z.infer<typeof inspectionSchema>;
export type ExpenseInput = z.infer<typeof zExpense>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type IncomeInput = z.infer<typeof zIncome>;
