export enum DocumentTag {
  Lease = 'Lease',
  Expense = 'Expense',
  Compliance = 'Compliance',
  Insurance = 'Insurance',
  Other = 'Other',
}

export interface DocumentItem {
  id: string;
  propertyId?: string;
  title: string;
  url: string;
  tag: DocumentTag;
}
