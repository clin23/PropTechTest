import { z } from 'zod';

export const AnalyticsState = z.object({
  viz: z.enum(['line', 'pie', 'custom']).default('line'),
  metric: z.enum(['net', 'income', 'expenses']).default('net'),
  groupBy: z.enum(['time', 'property', 'category', 'tenant']).default('time'),
  granularity: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  from: z.string(),
  to: z.string(),
  filters: z
    .object({
      properties: z.array(z.string()).default([]),
      categories: z.array(z.string()).default([]),
      incomeTypes: z.array(z.string()).default([]),
      expenseTypes: z.array(z.string()).default([]),
      tenants: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
    })
    .default({}),
});

export type AnalyticsStateType = z.infer<typeof AnalyticsState>;
