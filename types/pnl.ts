export type PnlPoint = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type PnlSummary = {
  period: 'last6m' | 'last12m';
  series: PnlPoint[];
  totals: { income: number; expenses: number; net: number };
};
