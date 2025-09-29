export interface PropertyEvent {
  date: string;
  title: string;
  severity?: "high" | "med" | "low";
}

export interface PropertySummary {
  id: string;
  address: string;
  imageUrl?: string;
  rent: number;
  tenant: string;
  leaseStart: string;
  leaseEnd: string;
  events: PropertyEvent[];
}

export type LedgerStatus = "paid" | "unpaid" | "follow_up";

export interface LedgerEntry {
  id: string;
  date: string;
  amount: number;
  balance: number;
  status: LedgerStatus;
  evidenceUrl?: string | null;
  evidenceName?: string | null;
  description?: string;
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  uploaded: string;
}

