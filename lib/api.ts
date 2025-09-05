import type { ApplicationRow } from '../components/ApplicationsTable';
import type { ExpenseRow } from '../components/ExpensesTable';
import type { Listing } from '../types/listing';

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

export interface Application {
  id: string;
  applicant: string;
  property: string;
  status: string;
  // include any other fields returned by `/applications/{id}`
}

export interface PnLPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  critical: boolean;
  normal: boolean;
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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

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
export const listApplications = () =>
  api<ApplicationRow[]>('/applications');
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

export interface PnLSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  monthly: { month: string; net: number }[];
}

export const listExpenses = (propertyId: string) =>
  api<ExpenseRow[]>(`/properties/${propertyId}/expenses`);
export const getExpense = (propertyId: string, id: string) =>
  api<Expense>(`/properties/${propertyId}/expenses/${id}`);
export const createExpense = (propertyId: string, payload: any) =>
  api(`/properties/${propertyId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateExpense = (
  propertyId: string,
  id: string,
  payload: any
) =>
  api(`/properties/${propertyId}/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteExpense = (propertyId: string, id: string) =>
  api(`/properties/${propertyId}/expenses/${id}`, { method: 'DELETE' });
export const uploadExpenseReceipt = (
  propertyId: string,
  id: string,
  file: File
) => {
  const form = new FormData();
  form.append('receipt', file);
  return api(`/properties/${propertyId}/expenses/${id}/receipt`, {
    method: 'POST',
    body: form,
  });
};
export const getPnLSummary = (propertyId: string) =>
  api<PnLSummary>(`/properties/${propertyId}/pnl`);

// Vendors
export const listVendors = () => api<Vendor[]>('/vendors');
export const createVendor = (payload: Vendor) =>
  api('/vendors', { method: 'POST', body: JSON.stringify(payload) });
export const updateVendor = (id: string, payload: Partial<Vendor>) =>
  api(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteVendor = (id: string) =>
  api(`/vendors/${id}`, { method: 'DELETE' });
export const uploadDocument = () => api<{ url: string }>('/upload', { method: 'POST' });
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
