import type { ApplicationRow, Application } from '../types/application';
import type { ExpenseRow } from '../types/expense';
import type { Listing } from '../types/listing';
import type { IncomeRow } from '../types/income';
import type {
  PropertySummary,
  LedgerEntry,
  PropertyDocument,
} from "../types/property";
import type { PnlSummary } from '../types/pnl';
import type { TaskDto } from '../types/tasks';

export interface Inspection {
  id: string;
  propertyId: string;
  type: string;
  status: string;
  date: string;
}

export interface Vendor {
  id?: string;
  name: string;
  tags: string[];
  favourite?: boolean;
  insured?: boolean;
  licensed?: boolean;
  avgResponseTime?: number;
  documents?: string[];
}

// Application types moved to types/application.ts

export interface NotificationSettings {
  arrears: { email: boolean; sms: boolean; inApp: boolean };
  maintenance: { email: boolean; sms: boolean; inApp: boolean };
  compliance: { email: boolean; sms: boolean; inApp: boolean };
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface Reminder {
  id: string;
  propertyId: string;
  propertyAddress: string;
  type: 'lease_expiry' | 'rent_review' | 'insurance_renewal' | 'inspection_due' | 'custom';
  title: string;
  dueDate: string;
  severity: 'high' | 'med' | 'low';
}

export interface TenantNote {
  id: string;
  propertyId: string;
  text: string;
  createdAt: string;
}

export interface PropertyDataExport {
  property: {
    id: string;
    address: string;
    imageUrl?: string;
    tenant: string;
    leaseStart: string;
    leaseEnd: string;
    rent: number;
    archived?: boolean;
  };
  tenant: { id: string; name: string; propertyId: string } | null;
  incomes: IncomeRow[];
  expenses: ExpenseRow[];
  rentLedger: {
    id: string;
    propertyId: string;
    tenantId: string;
    amount: number;
    dueDate: string;
    status: string;
    paidDate?: string;
  }[];
  documents: {
    id: string;
    propertyId?: string;
    tenantId?: string;
    title: string;
    url: string;
    tag: string;
  }[];
  reminders: {
    id: string;
    propertyId: string;
    type: string;
    title: string;
    dueDate: string;
    severity: string;
  }[];
  tenantNotes: TenantNote[];
  tasks: TaskDto[];
}

export interface Notification {
  id: string;
  propertyId?: string;
  type?: string;
  message: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  address: string;
  currentRent: number;
  nextReview: string;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? '/api';

  const headers = new Headers(init?.headers);
  headers.set(
    'Authorization',
    `Bearer ${
      typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
    }`
  );
  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(base + path, {
    ...init,
    headers,
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : (undefined as T);
}

export const listProperties = () => api<PropertySummary[]>('/properties');
export const getProperty = (id: string) => api<PropertySummary>(`/properties/${id}`);
export const createProperty = (payload: any) =>
  api<PropertySummary>('/properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateProperty = (id: string, payload: any) =>
  api<PropertySummary>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteProperty = (id: string) =>
  api(`/properties/${id}`, { method: 'DELETE' });
export const exportPropertyData = (id: string) =>
  api<PropertyDataExport>(`/properties/${id}/export`);
export const listLedger = (propertyId: string) =>
  api<LedgerEntry[]>(`/rent-ledger?propertyId=${propertyId}`);
export const updateLedgerEntry = (
  id: string,
  payload: { amount?: number; date?: string }
) =>
  api(`/rent-ledger/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const listTenantNotes = (propertyId: string) =>
  api<TenantNote[]>(`/tenant-crm?propertyId=${propertyId}`);
export const addTenantNote = (propertyId: string, text: string) =>
  api<TenantNote>(`/tenant-crm`, {
    method: 'POST',
    body: JSON.stringify({ propertyId, text }),
  });

// Inspections
export const getInspections = (params?: {
  propertyId?: string;
  type?: string;
  status?: string;
}) => {
  const query = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v) as [string, string][]
      ).toString()
    : "";
  const path = `/inspections${query ? `?${query}` : ""}`;
  return api<Inspection[]>(path);
};
export const createInspection = (payload: any) =>
  api('/inspections', { method: 'POST', body: JSON.stringify(payload) });
export const patchInspection = (id: string, payload: any) =>
  api(`/inspections/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const postInspectionItems = (id: string, payload: any) =>
  api(`/inspections/${id}/items`, { method: 'POST', body: JSON.stringify(payload) });
export const getInspectionReport = async (id: string) => {
  const res = await fetch(
    (process.env.NEXT_PUBLIC_API_BASE ?? '/api') + `/inspections/${id}/report`,
    {
      headers: {
        Authorization: `Bearer ${
          typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
        }`,
      },
      cache: 'no-store',
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
};
export const shareInspectionReport = (id: string) =>
  api(`/inspections/${id}/share`, { method: 'POST' });

// Applications
export const listApplications = (propertyId?: string) =>
  api<ApplicationRow[]>(
    `/applications${propertyId ? `?propertyId=${propertyId}` : ''}`
  );
export const createApplication = (payload: any) =>
  api('/applications', { method: 'POST', body: JSON.stringify(payload) });
export const getApplication = (id: string) => api<Application>(`/applications/${id}`);
export const updateApplication = (id: string, payload: any) => api(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const postScore = (id: string, payload: any) =>
  api(`/applications/${id}/score`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Listings
export const createListing = (payload: Omit<Listing, 'id'>) =>
  api<Listing>('/listings', { method: 'POST', body: JSON.stringify(payload) });
export const listListings = () => api<Listing[]>('/listings');
export const generateListingCopy = (features: string) =>
  api<{ text: string }>("/ai/listing-copy", {
    method: "POST",
    body: JSON.stringify({ features }),
  });
export const exportListingPack = async (id: string) => {
  const res = await fetch((process.env.NEXT_PUBLIC_API_BASE ?? '/api') + `/listings/${id}/export`, {
    headers: {
      Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
};

// Rent review
export const getRentReview = (tenancyId: string) => api(`/tenancies/${tenancyId}/rent-review`);
export const postRentReview = (tenancyId: string, payload: any) => api(`/tenancies/${tenancyId}/rent-review`, { method: 'POST', body: JSON.stringify(payload) });
export const listLeases = () => api<Lease[]>('/leases');
export const computeRentIncrease = (payload: any) =>
  api<{ newRent: number }>('/rent-review/calc', { method: 'POST', body: JSON.stringify(payload) });
export const generateNotice = (payload: any) =>
  api('/rent-review/notice', { method: 'POST', body: JSON.stringify(payload) });

// Expenses & PnL
export interface Expense extends ExpenseRow {}
export interface Income extends IncomeRow {}

export interface PnLSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  monthly: { month: string; net: number }[];
}

export const listExpenses = (params?: {
  propertyId?: string;
  from?: string;
  to?: string;
  category?: string;
  vendor?: string;
}) => {
  const query = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v) as [string, string][]
      ).toString()
    : '';
  const path = `/expenses${query ? `?${query}` : ''}`;
  return api<ExpenseRow[]>(path);
};
export const getExpense = (id: string) => api<Expense>(`/expenses/${id}`);
export const createExpense = (payload: any) =>
  api('/expenses', { method: 'POST', body: JSON.stringify(payload) });
export const updateExpense = (id: string, payload: any) =>
  api(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteExpense = (id: string) =>
  api(`/expenses/${id}`, { method: 'DELETE' });
export const uploadExpenseReceipt = (id: string, file: File) => {
  const form = new FormData();
  form.append('receipt', file);
  return api(`/expenses/${id}/receipt`, {
    method: 'POST',
    body: form,
  });
};
export const getPnLSummary = (propertyId: string) =>
  api<PnLSummary>(`/properties/${propertyId}/pnl`);

export interface PnL {
  income: number;
  expenses: number;
  net: number;
  series: { month: string; income: number; expenses: number; net: number }[];
}

export const getPnL = (params: {
  propertyId: string;
  from: string;
  to: string;
}) => {
  const query = new URLSearchParams(params).toString();
  return api<PnL>(`/pnl?${query}`);
};

export const listIncome = (propertyId: string) =>
  api<IncomeRow[]>(`/properties/${propertyId}/income`);
export const createIncome = (propertyId: string, payload: any) =>
  api(`/properties/${propertyId}/income`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateIncome = (
  propertyId: string,
  id: string,
  payload: any
) =>
  api(`/properties/${propertyId}/income/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteIncome = (propertyId: string, id: string) =>
  api(`/properties/${propertyId}/income/${id}`, { method: 'DELETE' });

// Documents
export interface DocumentRecord {
  id: string;
  title: string;
  propertyId?: string;
  tag: string;
  url: string;
}

export const listDocuments = (params?: {
  propertyId?: string;
  tag?: string;
  query?: string;
}) => {
  const query = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v) as [string, string][]
      ).toString()
    : '';
  const path = `/documents${query ? `?${query}` : ''}`;
  return api<DocumentRecord[]>(path);
};

export const createDocument = (payload: {
  url: string;
  title: string;
  tag: string;
  propertyId?: string;
}) =>
  api<DocumentRecord>('/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const searchDocuments = (search: string) =>
  listDocuments({ query: search });

// Property documents
export const listPropertyDocuments = (propertyId: string) =>
  listDocuments({ propertyId });

// Vendors
export const listVendors = () => api<Vendor[]>('/vendors');
export const createVendor = (payload: Vendor) =>
  api('/vendors', { method: 'POST', body: JSON.stringify(payload) });
export const updateVendor = (id: string, payload: Partial<Vendor>) =>
  api(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteVendor = (id: string) =>
  api(`/vendors/${id}`, { method: 'DELETE' });
export const uploadFile = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api<{ url: string }>('/upload', { method: 'POST', body: form, headers: {} });
};
export const scanReceipt = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api<{ date: string; amount: number; category: string; vendor: string; notes: string }>("/ai/doc-scan", {
    method: "POST",
    body: form,
    headers: {},
  });
};
export const addVendorDocument = (id: string, url: string) =>
  api(`/vendors/${id}/documents`, { method: 'POST', body: JSON.stringify({ url }) });
export const removeVendorDocument = (id: string, url: string) =>
  api(`/vendors/${id}/documents`, { method: 'DELETE', body: JSON.stringify({ url }) });

// Notification settings
export const getNotificationSettings = () =>
  api<NotificationSettings>('/me/notification-settings');
export const updateNotificationSettings = (payload: NotificationSettings) =>
  api('/me/notification-settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

// Reminders & notifications
export const listReminders = (params?: { propertyId?: string }) => {
  const query = params?.propertyId ? `?propertyId=${params.propertyId}` : '';
  return api<Reminder[]>(`/reminders${query}`);
};
export const listNotifications = () => api<Notification[]>('/notifications');
export const getPnlSummary = (
  period: 'last6m' | 'last12m',
  propertyId?: string,
) => {
  const params = new URLSearchParams({ period });
  if (propertyId) params.set('propertyId', propertyId);
  return api<PnlSummary>(`/pnl/summary?${params.toString()}`);
};

// Tasks
export const listTasks = (params?: {
  propertyId?: string;
  cadence?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  parentId?: string;
  archived?: boolean;
}) => {
  const query = params
    ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
  const path = `/tasks${query ? `?${query}` : ''}`;
  return api<TaskDto[]>(path);
};
export const createTask = (payload: any) =>
  api<TaskDto>('/tasks', { method: 'POST', body: JSON.stringify(payload) });
export const getTask = (id: string) => api<TaskDto>(`/tasks/${id}`);
export const updateTask = (id: string, payload: any) =>
  api<TaskDto>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteTask = (id: string) =>
  api(`/tasks/${id}`, { method: 'DELETE' });
export const archiveTask = (id: string) =>
  api(`/tasks/${id}/archive`, { method: 'POST' });
export const unarchiveTask = (id: string) =>
  api(`/tasks/${id}/unarchive`, { method: 'POST' });
export const completeTask = (id: string) =>
  api<TaskDto>(`/tasks/${id}/complete`, { method: 'POST' });
export const bulkTasks = (payload: any) =>
  api<TaskDto[]>('/tasks/bulk', { method: 'POST', body: JSON.stringify(payload) });