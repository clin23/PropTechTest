import type { ApplicationRow } from '../components/ApplicationsTable';
import type { ExpenseRow } from '../components/ExpensesTable';

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
  documents?: string[];
}

export interface Application {
  id: string;
  applicant: string;
  property: string;
  status: string;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || '') + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Inspections
export const getInspections = () => api<Inspection[]>('/inspections');
export const createInspection = (payload: any) =>
  api('/inspections', { method: 'POST', body: JSON.stringify(payload) });
export const patchInspection = (id: string, payload: any) =>
  api(`/inspections/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const postInspectionItems = (id: string, payload: any) =>
  api(`/inspections/${id}/items`, { method: 'POST', body: JSON.stringify(payload) });

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
export const createListing = (payload: any) => api('/listings', { method: 'POST', body: JSON.stringify(payload) });
export const getListingExport = (id: string) => api(`/listings/${id}/export`);

// Rent review
export const getRentReview = (tenancyId: string) => api(`/tenancies/${tenancyId}/rent-review`);
export const postRentReview = (tenancyId: string, payload: any) => api(`/tenancies/${tenancyId}/rent-review`, { method: 'POST', body: JSON.stringify(payload) });

// Expenses & PnL
export const listExpenses = (propertyId: string) => api<ExpenseRow[]>(`/properties/${propertyId}/expenses`);
export const createExpense = (propertyId: string, payload: any) => api(`/properties/${propertyId}/expenses`, { method: 'POST', body: JSON.stringify(payload) });
export const getPnL = (propertyId: string) => api<any[]>(`/properties/${propertyId}/pnl`);

// Vendors
export const listVendors = () => api<Vendor[]>('/vendors');
export const createVendor = (payload: Vendor) =>
  api('/vendors', { method: 'POST', body: JSON.stringify(payload) });
export const updateVendor = (id: string, payload: Partial<Vendor>) =>
  api(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// Notification settings
export const getNotificationSettings = () =>
  api<NotificationSettings>('/me/notification-settings');
export const updateNotificationSettings = (payload: NotificationSettings) =>
  api('/me/notification-settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
