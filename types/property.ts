export interface PropertyEvent {
  date: string;
  title: string;
}

export interface PropertySummary {
  id: string;
  address: string;
  rent: number;
  tenant: string;
  leaseStart: string;
  leaseEnd: string;
  events: PropertyEvent[];
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  uploaded: string;
}

