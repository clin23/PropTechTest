export interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  vendor: string;
  amount: number;
  gst: number;
  notes?: string;
  receiptUrl?: string;
}
