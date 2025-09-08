export type PnLPoint = { month: string; income: number; expenses: number; net: number };
export type PnLSeries = { series: PnLPoint[]; totals: { income: number; expenses: number; net: number } };
export type RentMetrics = { expected: number; received: number; collectionRate: number; arrearsCount: number; arrearsAmount: number };
export type ExpenseSlice = { category: string; amount: number };
export type ExpenseBreakdown = { slices: ExpenseSlice[]; total: number };
export type Occupancy = { occupiedDays: number; vacantDays: number; occupancyRate: number };
