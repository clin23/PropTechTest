export type Property = {
  id: string;
  address: string;
  imageUrl?: string;
  tenant: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  archived?: boolean;
};
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
  label?: string;
};
export type Income = {
  id: string;
  propertyId: string;
  tenantId?: string;
  date: string;
  category: string;
  amount: number;
  notes?: string;
  label?: string;
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
export type ReminderSeverity = 'high' | 'med' | 'low';
export type Reminder = {
  id: string;
  propertyId: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  severity: ReminderSeverity;
};
export type RentEntry = {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'late';
  paidDate?: string;
};
export type TenantNote = {
  id: string;
  propertyId: string;
  text: string;
  createdAt: string;
};
export type Notification = { id: string; [key: string]: any };
import { TaskDto } from '../../types/tasks';

const initialProperties: Property[] = [
  {
    id: '1',
    address: '123 Main St',
    tenant: 'Alice Tenant',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rent: 1200,
  },
  {
    id: '2',
    address: '456 Oak Ave',
    tenant: 'Bob Renter',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-05-31',
    rent: 950,
  },
  {
    id: '3',
    address: '10 Rose St',
    tenant: '',
    leaseStart: '',
    leaseEnd: '',
    rent: 0,
    archived: true,
  },
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
    category: 'Council rates',
    vendor: 'City Council',
    amount: 1000,
    gst: 0,
  },
  {
    id: 'exp2',
    propertyId: '1',
    date: '2024-02-10',
    category: 'Landlord insurance',
    vendor: 'Insurance Co',
    amount: 500,
    gst: 0,
  },
  {
    id: 'exp3',
    propertyId: '1',
    date: '2024-03-15',
    category: 'Plumbing',
    vendor: 'Plumber Co',
    amount: 150,
    gst: 20,
  },
  {
    id: 'exp6',
    propertyId: '1',
    date: '2024-04-12',
    category: 'Gardening & landscaping',
    vendor: 'GreenThumb',
    amount: 180,
    gst: 25,
  },
  {
    id: 'exp7',
    propertyId: '1',
    date: '2024-05-18',
    category: 'Electrical',
    vendor: 'Sparky Ltd',
    amount: 220,
    gst: 30,
  },
  {
    id: 'exp8',
    propertyId: '1',
    date: '2024-06-05',
    category: 'General repairs',
    vendor: 'Handyman Co',
    amount: 160,
    gst: 24,
  },
  {
    id: 'exp4',
    propertyId: '2',
    date: '2024-04-01',
    category: 'General repairs',
    vendor: 'Handyman',
    amount: 200,
    gst: 30,
  },
  {
    id: 'exp5',
    propertyId: '2',
    date: '2024-05-01',
    category: 'End-of-lease clean',
    vendor: 'Cleaners Ltd',
    amount: 300,
    gst: 45,
  },
  {
    id: 'exp9',
    propertyId: '2',
    date: '2024-01-20',
    category: 'Council rates',
    vendor: 'City Council',
    amount: 800,
    gst: 0,
  },
  {
    id: 'exp10',
    propertyId: '2',
    date: '2024-02-14',
    category: 'Plumbing',
    vendor: 'Plumber Co',
    amount: 120,
    gst: 18,
  },
  {
    id: 'exp11',
    propertyId: '2',
    date: '2024-03-22',
    category: 'Landlord insurance',
    vendor: 'Insurance Co',
    amount: 400,
    gst: 0,
  },
  {
    id: 'exp12',
    propertyId: '2',
    date: '2024-06-10',
    category: 'Miscellaneous',
    vendor: 'Misc Vendor',
    amount: 100,
    gst: 15,
  },
];

const initialIncomes: Income[] = [
  {
    id: 'inc1',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2024-01-01',
    category: 'Base rent',
    amount: 1200,
  },
  {
    id: 'inc2',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2024-01-15',
    category: 'Utilities reimbursement',
    amount: 50,
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
    propertyId: '1',
    title: 'invoice.pdf',
    url: '/docs/invoice-prop1.pdf',
    tag: DocumentTag.Other,
  },
  {
    id: 'doc4',
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
    severity: 'med',
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

const initialTasks: TaskDto[] = [
  {
    id: 'task1',
    title: 'Fix leaking tap',
    cadence: 'Immediate',
    dueDate: '2024-07-10',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'task2',
    title: 'Garden tidy-up',
    cadence: 'Monthly',
    dueDate: '2024-07-15',
    recurrence: { freq: 'MONTHLY', interval: 1 },
    properties: [
      { id: '1', address: '123 Main St' },
      { id: '2', address: '456 Oak Ave' },
    ],
    status: 'in_progress',
    priority: 'low',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-15',
  },
  {
    id: 'task3',
    title: 'Smoke alarm service',
    cadence: 'Yearly',
    dueDate: '2024-12-01',
    properties: [{ id: '2', address: '456 Oak Ave' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'task4',
    title: 'Insurance renewal',
    cadence: 'Yearly',
    dueDate: '2025-01-05',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'blocked',
    priority: 'high',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-20',
  },
  {
    id: 'task5',
    title: 'Log quarterly water rates',
    cadence: 'Monthly',
    dueDate: '2024-08-01',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'task6',
    title: 'End-of-lease clean',
    cadence: 'Immediate',
    dueDate: '2024-07-20',
    properties: [{ id: '2', address: '456 Oak Ave' }],
    status: 'done',
    priority: 'high',
    createdAt: '2024-06-01',
    updatedAt: '2024-07-01',
  },
  {
    id: 'task7',
    title: 'General inspection',
    cadence: 'Weekly',
    dueDate: '2024-07-12',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'task8',
    title: 'Paint touch-up',
    cadence: 'Custom',
    startDate: '2024-07-01',
    endDate: '2024-07-03',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'low',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
];

const initialRentLedger: RentEntry[] = [
  { id: 'rent1-jan', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-01-01', status: 'paid', paidDate: '2024-01-01' },
  { id: 'rent1-feb', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-02-01', status: 'paid', paidDate: '2024-02-01' },
  { id: 'rent1-mar', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-03-01', status: 'paid', paidDate: '2024-03-01' },
  { id: 'rent1-apr', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-04-01', status: 'paid', paidDate: '2024-04-01' },
  { id: 'rent1-may', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-05-01', status: 'paid', paidDate: '2024-05-01' },
  { id: 'rent1-jun', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-06-01', status: 'paid', paidDate: '2024-06-01' },
  { id: 'rent2-jan', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2024-01-01', status: 'paid', paidDate: '2024-01-01' },
  { id: 'rent2-feb', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2024-02-01', status: 'paid', paidDate: '2024-02-01' },
  { id: 'rent2-mar', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2024-03-01', status: 'paid', paidDate: '2024-03-01' },
  { id: 'rent2-apr', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2024-04-01', status: 'paid', paidDate: '2024-04-01' },
  { id: 'rent2-may', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2024-05-01', status: 'paid', paidDate: '2024-05-01' },
  { id: 'rent2-jun', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2024-06-01', status: 'late' },
];

const initialTenantNotes: TenantNote[] = [
  {
    id: 'tn1',
    propertyId: '1',
    text: 'Tenant called about leaking tap',
    createdAt: '2024-05-15',
  },
  {
    id: 'tn2',
    propertyId: '2',
    text: 'Discussed rent increase',
    createdAt: '2024-05-20',
  },
];

const initialNotifications: Notification[] = [
  {
    id: 'notificationSettings',
    arrears: { email: false, sms: false, inApp: false },
    maintenance: { email: false, sms: false, inApp: false },
    compliance: { email: false, sms: false, inApp: false },
    quietHoursStart: '',
    quietHoursEnd: '',
  },
  { id: 'note1', message: 'Welcome to PropTech' },
  { id: 'note2', message: 'Rent due reminder' },
];

type Store = {
  properties: Property[];
  tenants: Tenant[];
  expenses: Expense[];
  incomes: Income[];
  documents: Document[];
  reminders: Reminder[];
  rentLedger: RentEntry[];
  notifications: Notification[];
  tenantNotes: TenantNote[];
  tasks: TaskDto[];
};

const initStore = (): Store => ({
  properties: [...initialProperties],
  tenants: [...initialTenants],
  expenses: [...initialExpenses],
  incomes: [...initialIncomes],
  documents: [...initialDocuments],
  reminders: [...initialReminders],
  rentLedger: [...initialRentLedger],
  notifications: [...initialNotifications],
  tenantNotes: [...initialTenantNotes],
  tasks: [...initialTasks],
});

const g = globalThis as any;
const store: Store = g.__store || initStore();
g.__store = store;

export const {
  properties,
  tenants,
  expenses,
  incomes,
  documents,
  reminders,
  rentLedger,
  notifications,
  tenantNotes,
  tasks,
} = store;

export const isActiveProperty = (p: Property) => !p.archived;

export const resetStore = () => {
  const fresh = initStore();
  (Object.keys(store) as (keyof Store)[]).forEach((key) => {
    // mutate arrays in place so imported references stay valid
    store[key].length = 0;
    store[key].push(...fresh[key]);
  });
};

export const seedIfEmpty = () => {
  if (properties.length > 0) return;
  const fresh = initStore();
  (Object.keys(store) as (keyof Store)[]).forEach((key) => {
    store[key].push(...fresh[key]);
  });
};

export default {
  get properties() {
    return properties;
  },
  get tenants() {
    return tenants;
  },
  get expenses() {
    return expenses;
  },
  get incomes() {
    return incomes;
  },
  get documents() {
    return documents;
  },
  get reminders() {
    return reminders;
  },
  get rentLedger() {
    return rentLedger;
  },
  get notifications() {
    return notifications;
  },
  get tenantNotes() {
    return tenantNotes;
  },
  get tasks() {
    return tasks;
  },
};
