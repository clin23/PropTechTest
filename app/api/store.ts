// In-memory store for mock API routes during Phase-2 development.
// Data resets when the server restarts. Use resetStore() to restore defaults
// or replace these mocks with real persistence when a backend is available.

// --- Properties & Tenancies ---
const initialProperties = [
  { id: '1', address: '123 Main St', owner: 'Alice', rent: 500 },
  { id: '2', address: '55 Side Ave', owner: 'Bob', rent: 650 },
  { id: '3', address: '78 Circular Rd', owner: 'Carol', rent: 550 },
];
export const properties: any[] = [...initialProperties];

const initialTenancies = [
  { id: '1', propertyId: '1', currentRent: 500 },
  { id: '2', propertyId: '2', currentRent: 650 },
  { id: '3', propertyId: '3', currentRent: 550 },
];
export const tenancies: any[] = [...initialTenancies];

// --- Inspections ---
const initialInspections = [
  { id: '1', propertyId: '1', type: 'Entry', status: 'Scheduled', date: '2024-05-01' },
  { id: '2', propertyId: '1', type: 'Exit', status: 'Completed', date: '2024-03-15' },
  { id: '3', propertyId: '2', type: 'Routine', status: 'Scheduled', date: '2024-05-10' },
];
export const inspections: any[] = [...initialInspections];

// --- Applications ---
const initialApplications = [
  { id: '1', applicant: 'John Doe', property: '1', status: 'New' },
  { id: '2', applicant: 'Jane Smith', property: '2', status: 'Reviewed' },
  { id: '3', applicant: 'Mike Johnson', property: '3', status: 'Rejected' },
];
export const applications: any[] = [...initialApplications];

// --- Vendors ---
const initialVendors = [
  {
    id: '1',
    name: 'ACME Plumbing',
    tags: ['plumber'],
    insured: true,
    licensed: true,
    avgResponseTime: 2,
    documents: ['licence.pdf'],
  },
  {
    id: '2',
    name: 'Bright Electrics',
    tags: ['electrician'],
    insured: false,
    licensed: true,
    avgResponseTime: 5,
    documents: ['insurance.pdf'],
  },
  {
    id: '3',
    name: 'Clean & Co',
    tags: ['cleaner'],
    insured: true,
    licensed: false,
    avgResponseTime: 8,
    documents: [],
  },
];
export const vendors: any[] = [...initialVendors];

// --- Expenses ---
const initialExpenses = [
  { id: '1', propertyId: '1', date: '2024-01-01', category: 'Repairs', amount: 120 },
  { id: '2', propertyId: '1', date: '2024-02-15', category: 'Utilities', amount: 80 },
  { id: '3', propertyId: '2', date: '2024-02-20', category: 'Maintenance', amount: 200 },
  { id: '4', propertyId: '3', date: '2024-03-10', category: 'Gardening', amount: 60 },
];
export const expenses: any[] = [...initialExpenses];

export const notificationSettings = { email: true, sms: false, inApp: true };

export const listings: any[] = [];

export const rentReviews: any[] = [];

// Helper to reset all data back to its initial state
export function resetStore() {
  properties.splice(0, properties.length, ...initialProperties);
  tenancies.splice(0, tenancies.length, ...initialTenancies);
  inspections.splice(0, inspections.length, ...initialInspections);
  applications.splice(0, applications.length, ...initialApplications);
  vendors.splice(0, vendors.length, ...initialVendors);
  expenses.splice(0, expenses.length, ...initialExpenses);
  listings.splice(0, listings.length);
  rentReviews.splice(0, rentReviews.length);
}
