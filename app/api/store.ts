export type Property = { id: string; address: string };
export type Tenant = { id: string; name: string; propertyId: string };
export type Expense = {
  id: string;
  propertyId: string;
  date: string;
  category: string;
  vendor: string;
  amount: number;
  gst: number;
  notes?: string;
  receiptUrl?: string;
};
import { DocumentTag } from '../../types/document';

export type Document = {
  id: string;
  propertyId?: string;
  tenantId?: string;
  title: string;
  url: string;
  tag: DocumentTag;
};
export type ReminderType =
  | 'lease_expiry'
  | 'rent_review'
  | 'insurance_renewal'
  | 'inspection_due'
  | 'custom';
export type ReminderSeverity = 'high' | 'medium' | 'low';
export type Reminder = {
  id: string;
  propertyId: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  severity: ReminderSeverity;
};
export type RentEntry = { id: string; propertyId: string; tenantId: string; amount: number; dueDate: string; status: 'paid' | 'late'; paidDate?: string };
export type Notification = { id: string; [key: string]: any };

const initialProperties: Property[] = [
  { id: '1', address: '123 Main St' },
  { id: '2', address: '456 Oak Ave' },
  { id: '3', address: '789 Pine Rd' },
];

const initialTenants: Tenant[] = [
  { id: 'tenant1', name: 'Alice Tenant', propertyId: '1' },
  { id: 'tenant2', name: 'Bob Renter', propertyId: '2' },
];

const initialExpenses: Expense[] = [
  {
    id: 'exp1',
    propertyId: '1',
    date: '2024-01-05',
    category: 'Repairs',
    vendor: 'Plumber Co',
    amount: 150,
    gst: 20,
    notes: 'Leak fix',
  },
  {
    id: 'exp2',
    propertyId: '1',
    date: '2024-02-10',
    category: 'Gardening',
    vendor: 'Gardeners Ltd',
    amount: 80,
    gst: 12,
  },
  {
    id: 'exp3',
    propertyId: '2',
    date: '2024-03-15',
    category: 'Painting',
    vendor: 'Paint Pros',
    amount: 200,
    gst: 30,
  },
  {
    id: 'exp4',
    propertyId: '2',
    date: '2024-04-12',
    category: 'Electrical',
    vendor: 'Sparkies',
    amount: 120,
    gst: 18,
  },
  {
    id: 'exp5',
    propertyId: '3',
    date: '2024-05-20',
    category: 'Inspection',
    vendor: 'Roof Inspect',
    amount: 90,
    gst: 13,
  },
];

const initialDocuments: Document[] = [
  {
    id: 'doc1',
    propertyId: '1',
    title: 'lease.pdf',
    url: '/docs/lease-prop1.pdf',
    tag: DocumentTag.Lease,
  },
  {
    id: 'doc2',
    propertyId: '2',
    title: 'inspection.pdf',
    url: '/docs/inspection-prop2.pdf',
    tag: DocumentTag.Compliance,
  },
  {
    id: 'doc3',
    propertyId: '3',
    title: 'insurance.pdf',
    url: '/docs/insurance-prop3.pdf',
    tag: DocumentTag.Insurance,
  },
];

const initialReminders: Reminder[] = [
  {
    id: 'rem1',
    propertyId: '1',
    type: 'lease_expiry',
    title: 'Lease expires',
    dueDate: '2025-08-01',
    severity: 'high',
  },
  {
    id: 'rem2',
    propertyId: '2',
    type: 'rent_review',
    title: 'Rent review',
    dueDate: '2025-09-20',
    severity: 'medium',
  },
  {
    id: 'rem3',
    propertyId: '3',
    type: 'insurance_renewal',
    title: 'Insurance renewal',
    dueDate: '2025-10-10',
    severity: 'low',
  },
  {
    id: 'rem4',
    propertyId: '1',
    type: 'inspection_due',
    title: 'Inspection due',
    dueDate: '2025-11-05',
    severity: 'low',
  },
];

const initialRentLedger: RentEntry[] = [
  { id: 'rent1', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-05-01', status: 'paid', paidDate: '2024-05-01' },
  { id: 'rent2', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-06-01', status: 'late' },
];

const initialNotifications: Notification[] = [
  { id: 'notificationSettings', email: true, sms: false, push: true },
  { id: 'note1', message: 'Welcome to PropTech' },
  { id: 'note2', message: 'Rent due reminder' },
];

export let properties = [...initialProperties];
export let tenants = [...initialTenants];
export let expenses = [...initialExpenses];
export let documents = [...initialDocuments];
export let reminders = [...initialReminders];
export let rentLedger = [...initialRentLedger];
export let notifications = [...initialNotifications];

export const resetStore = () => {
  properties = [...initialProperties];
  tenants = [...initialTenants];
  expenses = [...initialExpenses];
  documents = [...initialDocuments];
  reminders = [...initialReminders];
  rentLedger = [...initialRentLedger];
  notifications = [...initialNotifications];
};

export default {
  properties,
  tenants,
  expenses,
  documents,
  reminders,
  rentLedger,
  notifications,
};
