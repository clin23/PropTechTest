export type Currency = number; // store cents as number; format on render

export interface Money {
  amountCents: number;
  currency: 'AUD';
}

export interface PortfolioSummary {
  propertiesCount: number;
  occupiedCount: number;
  vacancyCount: number;
}

export interface CashflowSnapshot {
  ytdNet: Money;
  mtdNet: Money;
}

export interface TimeSeriesPoint {
  date: string;           // ISO date
  cashInCents: number;    // inflow
  cashOutCents: number;   // outflow
  netCents: number;       // inflow - outflow
}

export interface ChartSeries {
  points: TimeSeriesPoint[];
}

export interface IncomeByPropertySlice {
  propertyId: string;
  propertyName: string;
  incomeCents: number; // over selected range
}

export interface ExpenseByCategorySlice {
  category:
    | 'Maintenance'
    | 'Utilities'
    | 'Insurance'
    | 'Rates'
    | 'Strata'
    | 'Mortgage Interest'
    | 'Property Mgmt'
    | 'Other';
  amountCents: number;
}

export interface RentDue {
  nextDueDate: string;       // ISO
  amountCents: number;
  status: 'Due' | 'Paid' | 'Overdue' | 'Upcoming';
}

export interface AlertItem {
  id: string;
  label: string;             // e.g., “Smoke alarm due”, “Lease expires in 30d”
  date?: string;             // if relevant
  severity: 'low' | 'med' | 'high';
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  dueDate?: string;
  priority?: 'low' | 'med' | 'high';
}

export interface PropertyCardData {
  propertyId: string;
  name: string;              // e.g., “12 Smith St, Chatswood”
  rentDue: RentDue;
  alerts: AlertItem[];
  tasks: TaskItem[];
}

export interface DashboardDTO {
  portfolio: PortfolioSummary;
  cashflow: CashflowSnapshot;
  lineSeries: ChartSeries;
  incomeByProperty: IncomeByPropertySlice[];
  expensesByCategory: ExpenseByCategorySlice[];
  properties: PropertyCardData[]; // 1..N
}
