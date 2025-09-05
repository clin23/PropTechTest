// In-memory store for mock API routes during Phase-2 development.
// Data resets when the server restarts. Use resetStore() to restore defaults
// or replace these mocks with real persistence when a backend is available.

// --- Properties & Tenancies ---
const initialProperties = [
  { id: '1', address: '123 Main St', owner: 'Alice', rent: 500 },
  { id: '2', address: '55 Side Ave', owner: 'Bob', rent: 650 },
];
export const properties: any[] = [...initialProperties];

const initialTenancies = [
  { id: '1', propertyId: '1', currentRent: 500, nextReview: '2024-07-01' },
  { id: '2', propertyId: '2', currentRent: 650, nextReview: '2024-08-15' },
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
  { id: '2', applicant: 'Jane Smith', property: '1', status: 'In Review' },
  { id: '3', applicant: 'Mike Johnson', property: '2', status: 'Accepted' },
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
  {
    id: '4',
    name: 'Rapid Roofing',
    tags: ['roofer'],
    insured: true,
    licensed: true,
    favourite: true,
    avgResponseTime: 4,
    documents: ['warranty.pdf'],
  },
];
export const vendors: any[] = [...initialVendors];

// --- Expenses ---
const initialExpenses = [
  {
    id: '1',
    propertyId: '1',
    date: '2024-01-05',
    category: 'Repairs',
    vendor: 'ACME Plumbing',
    amount: 120,
    gst: 12,
    receiptUrl: '/receipts/1.pdf',
  },
  {
    id: '2',
    propertyId: '1',
    date: '2024-02-15',
    category: 'Utilities',
    vendor: 'Energy Co',
    amount: 80,
    gst: 8,
    receiptUrl: '/receipts/2.pdf',
  },
  {
    id: '3',
    propertyId: '2',
    date: '2024-02-20',
    category: 'Maintenance',
    vendor: 'Clean & Co',
    amount: 200,
    gst: 20,
    receiptUrl: '/receipts/3.pdf',
  },
  {
    id: '4',
    propertyId: '2',
    date: '2024-03-10',
    category: 'Gardening',
    vendor: 'Gardeners Inc',
    amount: 60,
    gst: 6,
    receiptUrl: '/receipts/4.pdf',
  },
  {
    id: '5',
    propertyId: '1',
    date: '2024-03-25',
    category: 'Insurance',
    vendor: 'ABC Insurance',
    amount: 300,
    gst: 30,
    receiptUrl: '/receipts/5.pdf',
  },
];
export const expenses: any[] = [...initialExpenses];

export const notificationSettings = { email: true, sms: false, inApp: true };

export const listings: any[] = [];

const initialRentReviews = [
  {
    id: '1',
    tenancyId: '1',
    reviewDate: '2024-06-15',
    proposedRent: 520,
    status: 'Pending',
    noticeUrl: '/docs/rent-review-notice.pdf',
  },
];
export const rentReviews: any[] = [...initialRentReviews];

// Helper to reset all data back to its initial state
export function resetStore() {
  properties.splice(0, properties.length, ...initialProperties);
  tenancies.splice(0, tenancies.length, ...initialTenancies);
  inspections.splice(0, inspections.length, ...initialInspections);
  applications.splice(0, applications.length, ...initialApplications);
  vendors.splice(0, vendors.length, ...initialVendors);
  expenses.splice(0, expenses.length, ...initialExpenses);
  listings.splice(0, listings.length);
  rentReviews.splice(0, rentReviews.length, ...initialRentReviews);
}
