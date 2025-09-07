export interface CashflowSummary {
  monthIncome: number;
  monthExpenses: number;
  net: number;
}

export interface PropertySummary {
  id: string;
  address: string;
  tenantName: string;
  rentStatus: string;
  nextKeyDate: string;
}
