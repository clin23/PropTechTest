export const DEFAULT_DOCUMENT_TAGS = [
  'Lease',
  'Expense',
  'Compliance',
  'Insurance',
  'Other',
] as const;

export type DocumentTag = string;

export interface DocumentItem {
  id: string;
  propertyId?: string;
  title: string;
  url: string;
  tag: DocumentTag;
  notes?: string;
  links?: string[];
  uploadedAt?: string;
}
