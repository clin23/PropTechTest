export type ReminderType =
  | 'lease_expiry'
  | 'rent_review'
  | 'insurance_renewal'
  | 'inspection_due'
  | 'custom';

export type ReminderSeverity = 'low' | 'med' | 'high';

export type ReminderDto = {
  id: string;
  propertyId: string;
  propertyAddress: string;
  type: ReminderType;
  title: string;
  dueDate: string; // ISO date
  severity: ReminderSeverity;
};

