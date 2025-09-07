import { z } from 'zod';

export const inspectionSchema = z.object({
  propertyId: z.string(),
  type: z.string(),
  scheduledAt: z.string(),
  templateId: z.string().optional(),
});

export const expenseSchema = z.object({
  propertyId: z.string(),
  date: z.string(),
  category: z.string(),
  vendor: z.string(),
  amount: z.number(),
  gst: z.number().default(0),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const incomeSchema = z.object({
  amount: z.number(),
  source: z.string(),
  date: z.string(),
  notes: z.string().optional(),
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
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
