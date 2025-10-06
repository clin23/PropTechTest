export type ReminderType =
  | 'lease_expiry'
  | 'rent_review'
  | 'insurance_renewal'
  | 'inspection_due'
  | 'custom';

export type ReminderSeverity = 'low' | 'med' | 'high';

export type ReminderDocumentDto = {
  id: string;
  name: string;
  url?: string;
};

export type ReminderChecklistItemDto = {
  id: string;
  text: string;
  completed?: boolean;
};

export type ReminderDto = {
  id: string;
  propertyId: string;
  propertyAddress: string;
  type: ReminderType;
  title: string;
  dueDate: string; // ISO date
  dueTime?: string;
  recurrence?: string | null;
  severity: ReminderSeverity;
  documents?: ReminderDocumentDto[];
  checklist?: ReminderChecklistItemDto[];
  taskId?: string | null;
  checklistTaskIds?: Record<string, string> | null;
};

