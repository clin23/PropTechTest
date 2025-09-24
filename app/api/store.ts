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
  evidenceUrl?: string;
  evidenceName?: string;
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
  status: 'paid' | 'unpaid' | 'follow_up';
  paidDate?: string;
  evidenceUrl?: string;
  evidenceName?: string;
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
    leaseStart: '2025-03-01',
    leaseEnd: '2026-02-28',
    rent: 1200,
  },
  {
    id: '2',
    address: '456 Oak Ave',
    tenant: 'Bob Renter',
    leaseStart: '2025-04-01',
    leaseEnd: '2026-03-31',
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
    date: '2025-03-05',
    category: 'Council rates',
    vendor: 'City Council',
    amount: 1000,
    gst: 0,
  },
  {
    id: 'exp2',
    propertyId: '1',
    date: '2025-04-10',
    category: 'Landlord insurance',
    vendor: 'Insurance Co',
    amount: 500,
    gst: 0,
  },
  {
    id: 'exp3',
    propertyId: '1',
    date: '2025-05-15',
    category: 'Plumbing',
    vendor: 'Plumber Co',
    amount: 150,
    gst: 20,
  },
  {
    id: 'exp6',
    propertyId: '1',
    date: '2025-06-12',
    category: 'Gardening & landscaping',
    vendor: 'GreenThumb',
    amount: 180,
    gst: 25,
  },
  {
    id: 'exp7',
    propertyId: '1',
    date: '2025-07-18',
    category: 'Electrical',
    vendor: 'Sparky Ltd',
    amount: 220,
    gst: 30,
  },
  {
    id: 'exp8',
    propertyId: '1',
    date: '2025-08-05',
    category: 'General repairs',
    vendor: 'Handyman Co',
    amount: 160,
    gst: 24,
  },
  {
    id: 'exp4',
    propertyId: '2',
    date: '2025-06-01',
    category: 'General repairs',
    vendor: 'Handyman',
    amount: 200,
    gst: 30,
  },
  {
    id: 'exp5',
    propertyId: '2',
    date: '2025-07-01',
    category: 'End-of-lease clean',
    vendor: 'Cleaners Ltd',
    amount: 300,
    gst: 45,
  },
  {
    id: 'exp9',
    propertyId: '2',
    date: '2025-03-20',
    category: 'Council rates',
    vendor: 'City Council',
    amount: 800,
    gst: 0,
  },
  {
    id: 'exp10',
    propertyId: '2',
    date: '2025-04-14',
    category: 'Plumbing',
    vendor: 'Plumber Co',
    amount: 120,
    gst: 18,
  },
  {
    id: 'exp11',
    propertyId: '2',
    date: '2025-05-22',
    category: 'Landlord insurance',
    vendor: 'Insurance Co',
    amount: 400,
    gst: 0,
  },
  {
    id: 'exp12',
    propertyId: '2',
    date: '2025-08-10',
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
    date: '2025-03-01',
    category: 'Base rent',
    amount: 1200,
  },
  {
    id: 'inc2',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-03-15',
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
    dueDate: '2025-07-10',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: 'task2',
    title: 'Garden tidy-up',
    cadence: 'Monthly',
    dueDate: '2025-07-15',
    recurrence: { freq: 'MONTHLY', interval: 1 },
    properties: [
      { id: '1', address: '123 Main St' },
      { id: '2', address: '456 Oak Ave' },
    ],
    status: 'in_progress',
    priority: 'low',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-15',
  },
  {
    id: 'task3',
    title: 'Smoke alarm service',
    cadence: 'Yearly',
    dueDate: '2025-12-01',
    properties: [{ id: '2', address: '456 Oak Ave' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: 'task4',
    title: 'Insurance renewal',
    cadence: 'Yearly',
    dueDate: '2025-05-05',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'blocked',
    priority: 'high',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-20',
  },
  {
    id: 'task5',
    title: 'Log quarterly water rates',
    cadence: 'Monthly',
    dueDate: '2025-08-01',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: 'task6',
    title: 'End-of-lease clean',
    cadence: 'Immediate',
    dueDate: '2025-07-20',
    properties: [{ id: '2', address: '456 Oak Ave' }],
    status: 'done',
    priority: 'high',
    createdAt: '2025-06-01',
    updatedAt: '2025-07-01',
  },
  {
    id: 'task7',
    title: 'General inspection',
    cadence: 'Weekly',
    dueDate: '2025-07-12',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'normal',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: 'task8',
    title: 'Paint touch-up',
    cadence: 'Custom',
    startDate: '2025-07-01',
    endDate: '2025-07-03',
    properties: [{ id: '1', address: '123 Main St' }],
    status: 'todo',
    priority: 'low',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
];

const initialRentLedger: RentEntry[] = [
  { id: 'rent1-mar', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2025-03-01', status: 'paid', paidDate: '2025-03-01' },
  { id: 'rent1-apr', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2025-04-01', status: 'paid', paidDate: '2025-04-01' },
  { id: 'rent1-may', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2025-05-01', status: 'paid', paidDate: '2025-05-01' },
  { id: 'rent1-jun', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2025-06-01', status: 'paid', paidDate: '2025-06-01' },
  { id: 'rent1-jul', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2025-07-01', status: 'paid', paidDate: '2025-07-01' },
  { id: 'rent1-aug', propertyId: '1', tenantId: 'tenant1', amount: 1200, dueDate: '2025-08-01', status: 'paid', paidDate: '2025-08-01' },
  { id: 'rent2-mar', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2025-03-01', status: 'paid', paidDate: '2025-03-01' },
  { id: 'rent2-apr', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2025-04-01', status: 'paid', paidDate: '2025-04-01' },
  { id: 'rent2-may', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2025-05-01', status: 'paid', paidDate: '2025-05-01' },
  { id: 'rent2-jun', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2025-06-01', status: 'paid', paidDate: '2025-06-01' },
  { id: 'rent2-jul', propertyId: '2', tenantId: 'tenant2', amount: 950, dueDate: '2025-07-01', status: 'paid', paidDate: '2025-07-01' },
  {
    id: 'rent2-aug',
    propertyId: '2',
    tenantId: 'tenant2',
    amount: 950,
    dueDate: '2025-08-01',
    status: 'follow_up',
  },
];

const initialTenantNotes: TenantNote[] = [
  {
    id: 'tn1',
    propertyId: '1',
    text: 'Tenant called about leaking tap',
    createdAt: '2025-07-15',
  },
  {
    id: 'tn2',
    propertyId: '2',
    text: 'Discussed rent increase',
    createdAt: '2025-07-20',
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

type TaskFilters = {
  propertyId?: string;
  status?: string;
  cadence?: string;
  q?: string;
  from?: string;
  to?: string;
  parentId?: string;
  archived?: boolean;
};

export const listTasks = (filters: TaskFilters = {}): TaskDto[] => {
  const activeIds = new Set(properties.filter(isActiveProperty).map((p) => p.id));
  let data = tasks
    .map((t) => ({
      ...t,
      properties: t.properties.filter((p) => activeIds.has(p.id)),
    }))
    .filter((t) => t.properties.length > 0);

  if (filters.archived !== undefined) {
    data = data.filter((t) => !!t.archived === filters.archived);
  } else {
    data = data.filter((t) => !t.archived);
  }

  if (filters.propertyId) {
    data = data.filter((t) => t.properties.some((p) => p.id === filters.propertyId));
  }
  if (filters.status) {
    data = data.filter((t) => t.status === filters.status);
  }
  if (filters.cadence) {
    data = data.filter((t) => t.cadence === filters.cadence);
  }
  if (filters.parentId !== undefined) {
    data = data.filter((t) => t.parentId === filters.parentId);
  }
  if (filters.q) {
    const s = filters.q.toLowerCase();
    data = data.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description ? t.description.toLowerCase().includes(s) : false)
    );
  }
  if (filters.from || filters.to) {
    const fromTime = filters.from ? Date.parse(filters.from) : undefined;
    const toTime = filters.to ? Date.parse(filters.to) : undefined;
    data = data.filter((t) => {
      const start = t.startDate || t.dueDate;
      const end = t.endDate || t.dueDate;
      const sTime = start ? Date.parse(start) : undefined;
      const eTime = end ? Date.parse(end) : undefined;
      if (fromTime && eTime && eTime < fromTime) return false;
      if (toTime && sTime && sTime > toTime) return false;
      return true;
    });
  }

  return data;
};

export const createTask = (
  data: Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<TaskDto, 'id' | 'createdAt' | 'updatedAt'>>
): TaskDto => {
  const now = new Date().toISOString();
  const task: TaskDto = {
    ...data,
    id: data.id ?? crypto.randomUUID(),
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    archived: data.archived ?? false,
  } as TaskDto;
  tasks.push(task);
  return task;
};

export const updateTask = (id: string, data: Partial<TaskDto>): TaskDto | null => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updated = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() } as TaskDto;
  tasks[idx] = updated;
  return updated;
};

export const archiveTask = (id: string): boolean => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return false;
  task.archived = true;
  return true;
};

export const unarchiveTask = (id: string): boolean => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return false;
  task.archived = false;
  return true;
};

export const deleteTask = (id: string): boolean => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
};

export const completeTask = (id: string): TaskDto | null => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.status = task.status === 'done' ? 'todo' : 'done';
  task.updatedAt = new Date().toISOString();
  return task;
};

export const expandRecurrenceInRange = (
  task: TaskDto,
  _from: Date,
  _to: Date
): TaskDto[] => {
  // Basic stub - real recurrence handling to be implemented later
  return [task];
};

export const seedTasks = () => {
  if (tasks.length === 0) {
    tasks.push(...initialTasks);
  }
};

export const getTask = (id: string): TaskDto | undefined =>
  tasks.find((t) => t.id === id);

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
