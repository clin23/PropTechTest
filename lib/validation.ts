import { z } from 'zod';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_OPTIONS,
  INCOME_CATEGORY_OPTIONS,
} from './categories';

export const inspectionSchema = z.object({
  propertyId: z.string(),
  type: z.string(),
  scheduledAt: z.string(),
  templateId: z.string().optional(),
});

// Allow either a top-level expense group or a specific subcategory.
// Custom expense entries only expose group names in the UI but the backend
// previously only accepted subcategory labels, so include both here to avoid
// validation errors when saving.
const EXPENSE_CATEGORY_ENUM = [
  ...Object.keys(EXPENSE_CATEGORIES),
  ...EXPENSE_CATEGORY_OPTIONS,
] as [string, ...string[]];

export const zExpenseCategory = z.enum(EXPENSE_CATEGORY_ENUM);
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
  evidenceUrl: z.string().optional().nullable(),
  evidenceName: z.string().optional().nullable(),
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

export const zPnlSeries = z.object({
  series: z.array(zPnlPoint),
  totals: z.object({
    income: z.number(),
    expenses: z.number(),
    net: z.number(),
  }),
});

export const zRentMetrics = z.object({
  expected: z.number(),
  received: z.number(),
  collectionRate: z.number(),
  arrearsCount: z.number(),
  arrearsAmount: z.number(),
});

export const zExpenseSlice = z.object({
  category: z.string(),
  amount: z.number(),
});

export const zExpenseBreakdown = z.object({
  slices: z.array(zExpenseSlice),
  total: z.number(),
});

export const zOccupancy = z.object({
  occupiedDays: z.number(),
  vacantDays: z.number(),
  occupancyRate: z.number(),
});

const zReminderType = z.enum([
  'lease_expiry',
  'rent_review',
  'insurance_renewal',
  'inspection_due',
  'custom',
]);

const zReminderSeverity = z.enum(['low', 'med', 'high']);

export const zReminderDocument = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url().optional(),
});

export const zReminderChecklistItem = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean().optional(),
});

export const zReminder = z.object({
  id: z.string(),
  propertyId: z.string(),
  propertyAddress: z.string(),
  type: zReminderType,
  title: z.string(),
  dueDate: z.string(),
  dueTime: z.string().optional(),
  recurrence: z.string().nullable().optional(),
  severity: zReminderSeverity,
  documents: z.array(zReminderDocument).optional(),
  checklist: z.array(zReminderChecklistItem).optional(),
  taskId: z.string().nullable().optional(),
});

export const zReminders = z.array(zReminder);

export const zReminderPayload = z.object({
  propertyId: z.string(),
  type: zReminderType,
  title: z.string().min(1),
  dueDate: z.string().min(1),
  dueTime: z.string().optional(),
  recurrence: z.string().nullable().optional(),
  severity: zReminderSeverity,
  documents: z.array(zReminderDocument).optional(),
  checklist: z.array(zReminderChecklistItem).optional(),
  addToTasks: z.boolean().optional(),
});

export const zTask = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  // Accept any string so additional columns can be created on the Kanban board
  status: z.string().default('todo'),
  completed: z.boolean().optional(),
  priority: z.enum(['low','normal','high']).default('normal'),
  cadence: z.enum(['Immediate','Weekly','Monthly','Yearly','Custom']).default('Immediate'),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  recurrence: z
    .object({
      freq: z.enum(['DAILY','WEEKLY','MONTHLY','YEARLY','CUSTOM']).nullable(),
      interval: z.number().int().positive().optional(),
      byDay: z.array(z.string()).optional(),
      byMonthDay: z.array(z.number().int()).optional(),
      rrule: z.string().optional(),
      endsOn: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  properties: z.array(z.object({ id: z.string(), address: z.string() })).min(1),
  vendor: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .optional(),
  parentId: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const zTasks = z.array(zTask);

export type InspectionInput = z.infer<typeof inspectionSchema>;
export type ExpenseInput = z.infer<typeof zExpense>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type IncomeInput = z.infer<typeof zIncome>;
