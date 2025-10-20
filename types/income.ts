export interface IncomeRow {
  id: string;
  propertyId: string;
  tenantId?: string;
  date: string;
  category: string;
  amount: number;
  notes?: string;
  label?: string;
  evidenceUrl?: string;
  evidenceName?: string;
}

export type IncomeListType = "rentLedger" | "otherIncome";
