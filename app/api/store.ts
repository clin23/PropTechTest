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
export type Document = { id: string; propertyId?: string; tenantId?: string; name: string; url: string };
export type Reminder = { id: string; propertyId: string; note: string; due: string };
export type RentEntry = { id: string; propertyId: string; tenantId: string; amount: number; dueDate: string; status: 'paid' | 'late'; paidDate?: string };
export type Notification = { id: string; [key: string]: any };

const initialProperties: Property[] = [
  { id: 'prop1', address: '123 Main St' },
  { id: 'prop2', address: '456 Side Ave' },
  { id: 'prop3', address: '789 Oak Rd' },
];

const initialTenants: Tenant[] = [
  { id: 'tenant1', name: 'Alice Tenant', propertyId: 'prop1' },
  { id: 'tenant2', name: 'Bob Renter', propertyId: 'prop2' },
];

const initialExpenses: Expense[] = [
  {
    id: 'exp1',
    propertyId: 'prop1',
    date: '2024-01-05',
    category: 'Repairs',
    vendor: 'Plumber Co',
    amount: 150,
    gst: 20,
    notes: 'Leak fix',
  },
  {
    id: 'exp2',
    propertyId: 'prop1',
    date: '2024-02-10',
    category: 'Gardening',
    vendor: 'Gardeners Ltd',
    amount: 80,
    gst: 12,
  },
  {
    id: 'exp3',
    propertyId: 'prop2',
    date: '2024-03-15',
    category: 'Painting',
    vendor: 'Paint Pros',
    amount: 200,
    gst: 30,
  },
  {
    id: 'exp4',
    propertyId: 'prop2',
    date: '2024-04-12',
    category: 'Electrical',
    vendor: 'Sparkies',
    amount: 120,
    gst: 18,
  },
  {
    id: 'exp5',
    propertyId: 'prop3',
    date: '2024-05-20',
    category: 'Inspection',
    vendor: 'Roof Inspect',
    amount: 90,
    gst: 13,
  },
];

const initialDocuments: Document[] = [
  { id: 'doc1', propertyId: 'prop1', name: 'Lease Agreement', url: '/docs/lease-prop1.pdf' },
  { id: 'doc2', propertyId: 'prop2', name: 'Inspection Report', url: '/docs/inspection-prop2.pdf' },
  { id: 'doc3', propertyId: 'prop3', name: 'Insurance', url: '/docs/insurance-prop3.pdf' },
];

const initialReminders: Reminder[] = [
  { id: 'rem1', propertyId: 'prop1', note: 'Renew insurance', due: '2024-07-01' },
  { id: 'rem2', propertyId: 'prop2', note: 'Schedule inspection', due: '2024-06-15' },
];

const initialRentLedger: RentEntry[] = [
  { id: 'rent1', propertyId: 'prop1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-05-01', status: 'paid', paidDate: '2024-05-01' },
  { id: 'rent2', propertyId: 'prop1', tenantId: 'tenant1', amount: 1200, dueDate: '2024-06-01', status: 'late' },
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
