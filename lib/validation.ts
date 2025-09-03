import { z } from 'zod';

export const inspectionSchema = z.object({
  propertyId: z.string(),
  type: z.string(),
  scheduledAt: z.string(),
  templateId: z.string().optional(),
});

export const expenseSchema = z.object({
  amount: z.number(),
  category: z.string(),
  date: z.string(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string(),
  tags: z.array(z.string()).default([]),
});

export type InspectionInput = z.infer<typeof inspectionSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
