export type Property = {
  id: string;
  address: string;
  imageUrl?: string;
  tenant: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  value?: number;
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
export type ReminderDocument = {
  id: string;
  name: string;
  url?: string;
};

export type ReminderChecklistItem = {
  id: string;
  text: string;
  completed?: boolean;
};

export type Reminder = {
  id: string;
  propertyId: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  dueTime?: string;
  recurrence?: string | null;
  severity: ReminderSeverity;
  documents?: ReminderDocument[];
  checklist?: ReminderChecklistItem[];
  taskId?: string | null;
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
    value: 680_000,
  },
  {
    id: '2',
    address: '456 Oak Ave',
    tenant: 'Bob Renter',
    leaseStart: '2025-04-01',
    leaseEnd: '2026-03-31',
    rent: 950,
    value: 590_000,
  },
  {
    id: '3',
    address: '10 Rose St',
    tenant: '',
    leaseStart: '',
    leaseEnd: '',
    rent: 0,
    value: 520_000,
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
    id: 'exp-2025-09-01-council-rates',
    propertyId: '1',
    date: '2025-09-01',
    category: 'Council rates',
    vendor: 'City of Parramatta',
    amount: 450,
    gst: 0,
    notes: 'Quarterly council rates notice covering September billing period.',
    receiptUrl: 'https://example.com/receipts/2025-09-01-council-rates.pdf',
    label: 'Council rates Q3',
  },
  {
    id: 'exp-2025-09-02-general-repairs',
    propertyId: '1',
    date: '2025-09-02',
    category: 'General repairs',
    vendor: 'HandyFix Services',
    amount: 285,
    gst: 28.5,
    notes: 'Replaced ensuite tap washer and tested for leaks.',
    receiptUrl: 'https://example.com/receipts/2025-09-02-general-repairs.pdf',
    label: 'Ensuite repair',
  },
  {
    id: 'exp-2025-09-03-gardening',
    propertyId: '1',
    date: '2025-09-03',
    category: 'Gardening & landscaping',
    vendor: 'GreenScape Maintenance',
    amount: 195,
    gst: 19.5,
    notes: 'Full garden tidy, edging and mulch top up.',
    receiptUrl: 'https://example.com/receipts/2025-09-03-gardening.pdf',
  },
  {
    id: 'exp-2025-09-04-electrical',
    propertyId: '1',
    date: '2025-09-04',
    category: 'Electrical',
    vendor: 'BrightSpark Electrical',
    amount: 165,
    gst: 16.5,
    notes: 'Replaced hallway downlight transformers and issued certificate.',
    receiptUrl: 'https://example.com/receipts/2025-09-04-electrical.pdf',
    label: 'Lighting maintenance',
  },
  {
    id: 'exp-2025-09-05-gardening',
    propertyId: '1',
    date: '2025-09-05',
    category: 'Gardening & landscaping',
    vendor: 'GreenScape Maintenance',
    amount: 180,
    gst: 18,
    notes: 'Fortnightly garden tidy and hedge trim',
    receiptUrl: 'https://example.com/receipts/2025-09-05-gardening.pdf',
  },
  {
    id: 'exp-2025-09-06-plumbing',
    propertyId: '1',
    date: '2025-09-06',
    category: 'Plumbing',
    vendor: 'Rapid Plumbing Co.',
    amount: 210,
    gst: 21,
    notes: 'Cleared kitchen sink slow drain and resealed trap.',
    receiptUrl: 'https://example.com/receipts/2025-09-06-plumbing.pdf',
  },
  {
    id: 'exp-2025-09-07-pest-control',
    propertyId: '1',
    date: '2025-09-07',
    category: 'Pest control',
    vendor: 'SureShield Pest Control',
    amount: 175,
    gst: 17.5,
    notes: 'Targeted ant treatment in courtyard.',
    receiptUrl: 'https://example.com/receipts/2025-09-07-pest.pdf',
  },
  {
    id: 'exp-2025-09-08-water-rates',
    propertyId: '1',
    date: '2025-09-08',
    category: 'Water rates',
    vendor: 'Sydney Water',
    amount: 335,
    gst: 0,
    notes: 'Quarterly water usage invoice including service charges.',
    receiptUrl: 'https://example.com/receipts/2025-09-08-water.pdf',
  },
  {
    id: 'exp-2025-09-09-internet',
    propertyId: '1',
    date: '2025-09-09',
    category: 'Internet/phone',
    vendor: 'TelcoFast',
    amount: 89,
    gst: 8.9,
    notes: 'Internet connection for smart home monitoring.',
    receiptUrl: 'https://example.com/receipts/2025-09-09-internet.pdf',
  },
  {
    id: 'exp-2025-09-10-management-fees',
    propertyId: '1',
    date: '2025-09-10',
    category: 'Property management fees',
    vendor: 'PropTech Management',
    amount: 220,
    gst: 22,
    notes: 'Monthly property management service fee.',
    receiptUrl: 'https://example.com/receipts/2025-09-10-management.pdf',
    label: 'Management fee',
  },
  {
    id: 'exp-2025-09-11-accounting',
    propertyId: '1',
    date: '2025-09-11',
    category: 'Accounting & bookkeeping',
    vendor: 'Ledger & Co Accountants',
    amount: 145,
    gst: 14.5,
    notes: 'Processing landlord quarterly BAS lodgement.',
    receiptUrl: 'https://example.com/receipts/2025-09-11-accounting.pdf',
  },
  {
    id: 'exp-2025-09-12-plumbing',
    propertyId: '1',
    date: '2025-09-12',
    category: 'Plumbing',
    vendor: 'Rapid Plumbing Co.',
    amount: 240,
    gst: 24,
    notes: 'Repair leaking ensuite tap',
    receiptUrl: 'https://example.com/receipts/2025-09-12-plumbing.pdf',
  },
  {
    id: 'exp-2025-09-13-mortgage',
    propertyId: '1',
    date: '2025-09-13',
    category: 'Mortgage interest',
    vendor: 'HomeBank Lending',
    amount: 1235,
    gst: 0,
    notes: 'Monthly interest charge on investment loan.',
    receiptUrl: 'https://example.com/receipts/2025-09-13-mortgage.pdf',
    label: 'Loan interest',
  },
  {
    id: 'exp-2025-09-14-smoke-alarm',
    propertyId: '1',
    date: '2025-09-14',
    category: 'Smoke alarm service',
    vendor: 'SafeHome Compliance',
    amount: 110,
    gst: 10,
    notes: 'Annual smoke alarm service and certification',
    receiptUrl: 'https://example.com/receipts/2025-09-14-smoke.pdf',
  },
  {
    id: 'exp-2025-09-15-electrical-safety',
    propertyId: '1',
    date: '2025-09-15',
    category: 'Electrical safety check',
    vendor: 'SafeSwitch Electrical',
    amount: 198,
    gst: 19.8,
    notes: 'Annual electrical safety compliance inspection.',
    receiptUrl: 'https://example.com/receipts/2025-09-15-electrical-safety.pdf',
  },
  {
    id: 'exp-2025-09-16-gas-safety',
    propertyId: '1',
    date: '2025-09-16',
    category: 'Gas safety check',
    vendor: 'GasGuard Services',
    amount: 205,
    gst: 20.5,
    notes: 'Gas appliance safety check and flue test.',
    receiptUrl: 'https://example.com/receipts/2025-09-16-gas.pdf',
  },
  {
    id: 'exp-2025-09-17-pool-cert',
    propertyId: '1',
    date: '2025-09-17',
    category: 'Pool safety certificate',
    vendor: 'AquaCert Inspectors',
    amount: 260,
    gst: 26,
    notes: 'Pool safety certification renewal visit.',
    receiptUrl: 'https://example.com/receipts/2025-09-17-pool.pdf',
  },
  {
    id: 'exp-2025-09-18-appliance-service',
    propertyId: '1',
    date: '2025-09-18',
    category: 'Appliance service/repair',
    vendor: 'Appliance Pros',
    amount: 185,
    gst: 18.5,
    notes: 'Annual service of ducted air-conditioning unit.',
    receiptUrl: 'https://example.com/receipts/2025-09-18-appliance.pdf',
  },
  {
    id: 'exp-2025-09-19-rubbish',
    propertyId: '1',
    date: '2025-09-19',
    category: 'Rubbish removal',
    vendor: 'CleanCart Waste',
    amount: 95,
    gst: 9.5,
    notes: 'Removal of green waste after hedge trimming.',
    receiptUrl: 'https://example.com/receipts/2025-09-19-rubbish.pdf',
  },
  {
    id: 'exp-2025-09-20-capital-improvements',
    propertyId: '1',
    date: '2025-09-20',
    category: 'Capital improvements',
    vendor: 'Outdoor Living Co.',
    amount: 980,
    gst: 98,
    notes: 'Installed new composite decking boards on rear patio.',
    receiptUrl: 'https://example.com/receipts/2025-09-20-capital.pdf',
    label: 'Deck upgrade',
  },
  {
    id: 'exp-2025-09-21-depreciation-fixtures',
    propertyId: '1',
    date: '2025-09-21',
    category: 'Depreciation – fixtures & fittings',
    vendor: 'Asset Depreciation Services',
    amount: 410,
    gst: 41,
    notes: 'Quantity surveyor update for fixture depreciation schedule.',
    receiptUrl: 'https://example.com/receipts/2025-09-21-depreciation-fixtures.pdf',
  },
  {
    id: 'exp-2025-09-22-building-depreciation',
    propertyId: '1',
    date: '2025-09-22',
    category: 'Building depreciation',
    vendor: 'Asset Depreciation Services',
    amount: 390,
    gst: 39,
    notes: 'Building depreciation schedule update for FY25.',
    receiptUrl: 'https://example.com/receipts/2025-09-22-building-depreciation.pdf',
  },
  {
    id: 'exp-2025-09-23-legal-fees',
    propertyId: '1',
    date: '2025-09-23',
    category: 'Legal fees',
    vendor: 'Strata Legal Advisors',
    amount: 320,
    gst: 32,
    notes: 'Review of updated by-laws and compliance advice.',
    receiptUrl: 'https://example.com/receipts/2025-09-23-legal.pdf',
  },
  {
    id: 'exp-2025-09-24-postage',
    propertyId: '1',
    date: '2025-09-24',
    category: 'Postage & stationery',
    vendor: 'OfficeSupply Co.',
    amount: 38,
    gst: 3.8,
    notes: 'Posted rent review notices to tenants.',
    receiptUrl: 'https://example.com/receipts/2025-09-24-postage.pdf',
  },
  {
    id: 'exp-2025-09-25-misc',
    propertyId: '1',
    date: '2025-09-25',
    category: 'Miscellaneous',
    vendor: 'Harbour City Locksmiths',
    amount: 125,
    gst: 12.5,
    notes: 'Spare keys cut for contractors and tagged.',
    receiptUrl: 'https://example.com/receipts/2025-09-25-misc.pdf',
    label: 'Contractor keys',
  },
  {
    id: 'exp-2025-09-01-oak-council',
    propertyId: '2',
    date: '2025-09-01',
    category: 'Council rates',
    vendor: 'Cumberland Council',
    amount: 410,
    gst: 0,
    notes: 'Quarterly council rates instalment for Oak Ave.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-01-council.pdf',
    label: 'Council rates Q3',
  },
  {
    id: 'exp-2025-09-02-oak-repairs',
    propertyId: '2',
    date: '2025-09-02',
    category: 'General repairs',
    vendor: 'Oakfield Maintenance',
    amount: 265,
    gst: 26.5,
    notes: 'Adjusted sticking laundry door and rehung hinges.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-02-repairs.pdf',
    label: 'Laundry door fix',
  },
  {
    id: 'exp-2025-09-03-oak-gardening',
    propertyId: '2',
    date: '2025-09-03',
    category: 'Gardening & landscaping',
    vendor: 'Hillside Gardeners',
    amount: 175,
    gst: 17.5,
    notes: 'Fortnightly mow, edge, and shrub trim service.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-03-gardening.pdf',
  },
  {
    id: 'exp-2025-09-04-oak-electrical',
    propertyId: '2',
    date: '2025-09-04',
    category: 'Electrical',
    vendor: 'SparkRight Electrical',
    amount: 195,
    gst: 19.5,
    notes: 'Replaced motion sensor light on side entry.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-04-electrical.pdf',
    label: 'Sensor light replacement',
  },
  {
    id: 'exp-2025-09-05-oak-cleaning',
    propertyId: '2',
    date: '2025-09-05',
    category: 'Cleaning',
    vendor: 'FreshNest Cleaning',
    amount: 140,
    gst: 14,
    notes: 'Deep clean after short-stay guest departure.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-05-cleaning.pdf',
  },
  {
    id: 'exp-2025-09-06-oak-pest',
    propertyId: '2',
    date: '2025-09-06',
    category: 'Pest control',
    vendor: 'Shield Pest Experts',
    amount: 165,
    gst: 16.5,
    notes: 'Spider treatment for garage and eaves.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-06-pest.pdf',
    label: 'Quarterly pest spray',
  },
  {
    id: 'exp-2025-09-07-oak-appliance',
    propertyId: '2',
    date: '2025-09-07',
    category: 'Appliance repair',
    vendor: 'Premium Appliance Care',
    amount: 320,
    gst: 32,
    notes: 'Repaired dishwasher drain pump and tested cycle.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-07-appliance.pdf',
  },
  {
    id: 'exp-2025-09-08-oak-water',
    propertyId: '2',
    date: '2025-09-08',
    category: 'Water rates',
    vendor: 'Sydney Water',
    amount: 310,
    gst: 0,
    notes: 'Quarterly water usage and service charges.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-08-water.pdf',
    label: 'Water invoice Q3',
  },
  {
    id: 'exp-2025-09-09-oak-internet',
    propertyId: '2',
    date: '2025-09-09',
    category: 'Internet/phone',
    vendor: 'MetroNet Fibre',
    amount: 85,
    gst: 8.5,
    notes: 'Wi-Fi service for smart irrigation controller.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-09-internet.pdf',
  },
  {
    id: 'exp-2025-09-10-oak-insurance',
    propertyId: '2',
    date: '2025-09-10',
    category: 'Landlord insurance',
    vendor: 'SecureHome Insurance',
    amount: 480,
    gst: 0,
    notes: 'Policy adjustment adding accidental damage cover.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-10-insurance.pdf',
    label: 'Policy rider update',
  },
  {
    id: 'exp-2025-09-11-oak-strata-admin',
    propertyId: '2',
    date: '2025-09-11',
    category: 'Strata – admin fund',
    vendor: 'Oakfield Strata Group',
    amount: 250,
    gst: 0,
    notes: 'September administrative levy.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-11-strata-admin.pdf',
  },
  {
    id: 'exp-2025-09-12-oak-waste',
    propertyId: '2',
    date: '2025-09-12',
    category: 'Waste removal',
    vendor: 'EcoWaste Services',
    amount: 95,
    gst: 9.5,
    notes: 'Green waste skip for garden pruning.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-12-waste.pdf',
  },
  {
    id: 'exp-2025-09-13-oak-hvac',
    propertyId: '2',
    date: '2025-09-13',
    category: 'HVAC maintenance',
    vendor: 'ClimateCare Technicians',
    amount: 275,
    gst: 27.5,
    notes: 'Bi-annual ducted aircon service and filter replacement.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-13-hvac.pdf',
    label: 'Spring HVAC service',
  },
  {
    id: 'exp-2025-09-14-oak-windows',
    propertyId: '2',
    date: '2025-09-14',
    category: 'Window cleaning',
    vendor: 'Crystal Clear Windows',
    amount: 145,
    gst: 14.5,
    notes: 'Interior and exterior window clean including skylights.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-14-windows.pdf',
  },
  {
    id: 'exp-2025-09-15-oak-tree',
    propertyId: '2',
    date: '2025-09-15',
    category: 'Tree lopping',
    vendor: 'Canopy Care Arborists',
    amount: 360,
    gst: 36,
    notes: 'Pruned jacaranda branches away from roofline.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-15-tree.pdf',
    label: 'Jacaranda pruning',
  },
  {
    id: 'exp-2025-09-16-oak-pool',
    propertyId: '2',
    date: '2025-09-16',
    category: 'Pool maintenance',
    vendor: 'BlueWave Pools',
    amount: 210,
    gst: 21,
    notes: 'Chemical balance, vacuum, and filter backwash.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-16-pool.pdf',
  },
  {
    id: 'exp-2025-09-17-oak-fire',
    propertyId: '2',
    date: '2025-09-17',
    category: 'Fire safety compliance',
    vendor: 'SafeExit Fire Services',
    amount: 190,
    gst: 19,
    notes: 'Tested smoke alarms and replaced expired extinguisher.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-17-fire.pdf',
    label: 'Annual fire service',
  },
  {
    id: 'exp-2025-09-18-oak-gutter',
    propertyId: '2',
    date: '2025-09-18',
    category: 'Gutter cleaning',
    vendor: 'ClearFlow Roofing',
    amount: 155,
    gst: 15.5,
    notes: 'Cleared gutters and downpipes before storm season.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-18-gutter.pdf',
  },
  {
    id: 'exp-2025-09-19-oak-security',
    propertyId: '2',
    date: '2025-09-19',
    category: 'Security monitoring',
    vendor: 'NightWatch Security',
    amount: 120,
    gst: 12,
    notes: 'Monthly patrol service for rear laneway.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-19-security.pdf',
  },
  {
    id: 'exp-2025-09-20-oak-landscaping',
    propertyId: '2',
    date: '2025-09-20',
    category: 'Landscaping design',
    vendor: 'Verdant Concepts',
    amount: 240,
    gst: 24,
    notes: 'Concept plan for front verge refresh.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-20-landscaping.pdf',
    label: 'Front verge concept',
  },
  {
    id: 'exp-2025-09-21-oak-plumbing',
    propertyId: '2',
    date: '2025-09-21',
    category: 'Plumbing',
    vendor: 'RapidFlow Plumbing',
    amount: 205,
    gst: 20.5,
    notes: 'Cleared partial blockage in ensuite shower drain.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-21-plumbing.pdf',
  },
  {
    id: 'exp-2025-09-22-oak-paint',
    propertyId: '2',
    date: '2025-09-22',
    category: 'Painting',
    vendor: 'Brush & Roll Painters',
    amount: 180,
    gst: 18,
    notes: 'Touched up scuffed hallway walls after furniture move.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-22-paint.pdf',
  },
  {
    id: 'exp-2025-09-23-oak-solar',
    propertyId: '2',
    date: '2025-09-23',
    category: 'Solar maintenance',
    vendor: 'Sunset Renewables',
    amount: 230,
    gst: 23,
    notes: 'Inspection and clean of rooftop solar array.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-23-solar.pdf',
    label: 'Spring solar service',
  },
  {
    id: 'exp-2025-09-24-oak-pest-followup',
    propertyId: '2',
    date: '2025-09-24',
    category: 'Pest control',
    vendor: 'Shield Pest Experts',
    amount: 125,
    gst: 12.5,
    notes: 'Follow-up baiting for ant activity in pantry.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-24-pest.pdf',
  },
  {
    id: 'exp-2025-09-25-oak-misc',
    propertyId: '2',
    date: '2025-09-25',
    category: 'Miscellaneous',
    vendor: 'Bunnings Warehouse',
    amount: 90,
    gst: 9,
    notes: 'Purchased weather seals and replacement light globes.',
    receiptUrl: 'https://example.com/receipts/oak/2025-09-25-misc.pdf',
    label: 'Maintenance supplies',
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
  {
    id: 'inc-2025-09-01-rent',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-01',
    category: 'Base rent',
    amount: 650,
    notes: 'Rent payment for the first week of September.',
    label: 'Week 1 rent',
    evidenceUrl: 'https://example.com/income/2025-09-01-rent.pdf',
    evidenceName: '2025-09-01-rent.pdf',
  },
  {
    id: 'inc-2025-09-02-rent',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-02',
    category: 'Base rent',
    amount: 650,
    notes: 'Automated transfer received overnight.',
    label: 'Week 2 rent',
    evidenceUrl: 'https://example.com/income/2025-09-02-rent.pdf',
    evidenceName: '2025-09-02-rent.pdf',
  },
  {
    id: 'inc-2025-09-02-utilities',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-02',
    category: 'Utilities reimbursement',
    amount: 92,
    notes: 'Tenant reimbursed water usage charge for winter quarter.',
    label: 'Water usage reimbursement',
    evidenceUrl: 'https://example.com/income/2025-09-02-utilities.pdf',
    evidenceName: '2025-09-02-utilities.pdf',
  },
  {
    id: 'inc-2025-09-03-utilities',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-03',
    category: 'Utilities reimbursement',
    amount: 90,
    notes: 'Shared electricity cost for common area lighting.',
    label: 'Electricity reimbursement',
    evidenceUrl: 'https://example.com/income/2025-09-03-utilities.pdf',
    evidenceName: '2025-09-03-utilities.pdf',
  },
  {
    id: 'inc-2025-09-04-repairs',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-04',
    category: 'Repairs reimbursement',
    amount: 120,
    notes: 'Tenant reimbursed accidental damage to laundry door.',
    label: 'Laundry door repair reimbursement',
    evidenceUrl: 'https://example.com/income/2025-09-04-repairs.pdf',
    evidenceName: '2025-09-04-repairs.pdf',
  },
  {
    id: 'inc-2025-09-05-parking',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-05',
    category: 'Parking space rent',
    amount: 45,
    notes: 'Parking space license for visitor bay.',
    label: 'Parking licence',
    evidenceUrl: 'https://example.com/income/2025-09-05-parking.pdf',
    evidenceName: '2025-09-05-parking.pdf',
  },
  {
    id: 'inc-2025-09-06-storage',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-06',
    category: 'Storage/garage rent',
    amount: 55,
    notes: 'Monthly storage cage rental.',
    label: 'Storage cage',
    evidenceUrl: 'https://example.com/income/2025-09-06-storage.pdf',
    evidenceName: '2025-09-06-storage.pdf',
  },
  {
    id: 'inc-2025-09-07-cleaning',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-07',
    category: 'Short-stay cleaning/host fee',
    amount: 80,
    notes: 'Cleaning fee charged to short-stay guest.',
    label: 'Short-stay cleaning',
    evidenceUrl: 'https://example.com/income/2025-09-07-cleaning.pdf',
    evidenceName: '2025-09-07-cleaning.pdf',
  },
  {
    id: 'inc-2025-09-08-insurance-damage',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-08',
    category: 'Insurance payout – damage',
    amount: 350,
    notes: 'Insurance reimbursement for storm damage to pergola.',
    label: 'Insurance claim payout',
    evidenceUrl: 'https://example.com/income/2025-09-08-insurance-damage.pdf',
    evidenceName: '2025-09-08-insurance-damage.pdf',
  },
  {
    id: 'inc-2025-09-09-rent',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-09',
    category: 'Base rent',
    amount: 650,
    notes: 'Weekly rent payment received on time.',
    label: 'Week 3 rent',
    evidenceUrl: 'https://example.com/income/2025-09-09-rent.pdf',
    evidenceName: '2025-09-09-rent.pdf',
  },
  {
    id: 'inc-2025-09-10-reletting',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-10',
    category: 'Break lease / reletting fee',
    amount: 220,
    notes: 'Reletting fee charged after adding new tenant to lease.',
    label: 'Reletting fee',
    evidenceUrl: 'https://example.com/income/2025-09-10-reletting.pdf',
    evidenceName: '2025-09-10-reletting.pdf',
  },
  {
    id: 'inc-2025-09-11-late-fee',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-11',
    category: 'Late fee',
    amount: 45,
    notes: 'Fee for late rent submitted after reminder.',
    label: 'September late fee',
    evidenceUrl: 'https://example.com/income/2025-09-11-late-fee.pdf',
    evidenceName: '2025-09-11-late-fee.pdf',
  },
  {
    id: 'inc-2025-09-12-grant',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-12',
    category: 'Government grant/subsidy',
    amount: 130,
    notes: 'State government energy efficiency subsidy.',
    label: 'Energy grant',
    evidenceUrl: 'https://example.com/income/2025-09-12-grant.pdf',
    evidenceName: '2025-09-12-grant.pdf',
  },
  {
    id: 'inc-2025-09-13-misc',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-13',
    category: 'Miscellaneous income',
    amount: 75,
    notes: 'Laundry machine coin collection.',
    label: 'Laundry income',
    evidenceUrl: 'https://example.com/income/2025-09-13-misc.pdf',
    evidenceName: '2025-09-13-misc.pdf',
  },
  {
    id: 'inc-2025-09-14-arrears',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-14',
    category: 'Arrears catch-up',
    amount: 320,
    notes: 'Partial arrears cleared from earlier in year.',
    label: 'Arrears catch-up',
    evidenceUrl: 'https://example.com/income/2025-09-14-arrears.pdf',
    evidenceName: '2025-09-14-arrears.pdf',
  },
  {
    id: 'inc-2025-09-15-insurance',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-15',
    category: 'Insurance payout – rent default',
    amount: 400,
    notes: 'Insurance payment covering tenant hardship in July.',
    label: 'Rent default cover',
    evidenceUrl: 'https://example.com/income/2025-09-15-insurance.pdf',
    evidenceName: '2025-09-15-insurance.pdf',
  },
  {
    id: 'inc-2025-09-16-rent',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-16',
    category: 'Base rent',
    amount: 650,
    notes: 'Weekly rent payment',
    label: 'Week 4 rent',
    evidenceUrl: 'https://example.com/income/2025-09-16-rent.pdf',
    evidenceName: '2025-09-16-rent.pdf',
  },
  {
    id: 'inc-2025-09-17-utilities',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-17',
    category: 'Utilities reimbursement',
    amount: 85,
    notes: 'Gas usage reimbursement for winter heating.',
    label: 'Gas reimbursement',
    evidenceUrl: 'https://example.com/income/2025-09-17-utilities.pdf',
    evidenceName: '2025-09-17-utilities.pdf',
  },
  {
    id: 'inc-2025-09-18-repairs',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-18',
    category: 'Repairs reimbursement',
    amount: 110,
    notes: 'Reimbursement for damaged flyscreen replacement.',
    label: 'Flyscreen repair reimbursement',
    evidenceUrl: 'https://example.com/income/2025-09-18-repairs.pdf',
    evidenceName: '2025-09-18-repairs.pdf',
  },
  {
    id: 'inc-2025-09-19-parking',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-19',
    category: 'Parking space rent',
    amount: 45,
    notes: 'Visitor parking allocation for trades during works.',
    label: 'Trades parking',
    evidenceUrl: 'https://example.com/income/2025-09-19-parking.pdf',
    evidenceName: '2025-09-19-parking.pdf',
  },
  {
    id: 'inc-2025-09-20-storage',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-20',
    category: 'Storage/garage rent',
    amount: 55,
    notes: 'Weekend storage add-on for tenant relocation.',
    label: 'Storage add-on',
    evidenceUrl: 'https://example.com/income/2025-09-20-storage.pdf',
    evidenceName: '2025-09-20-storage.pdf',
  },
  {
    id: 'inc-2025-09-21-cleaning',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-21',
    category: 'Short-stay cleaning/host fee',
    amount: 85,
    notes: 'Departure clean billed to guest.',
    label: 'Guest clean',
    evidenceUrl: 'https://example.com/income/2025-09-21-cleaning.pdf',
    evidenceName: '2025-09-21-cleaning.pdf',
  },
  {
    id: 'inc-2025-09-22-misc',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-22',
    category: 'Miscellaneous income',
    amount: 95,
    notes: 'Pet rent for approved companion animal.',
    label: 'Pet rent',
    evidenceUrl: 'https://example.com/income/2025-09-22-misc.pdf',
    evidenceName: '2025-09-22-misc.pdf',
  },
  {
    id: 'inc-2025-09-23-rent',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-23',
    category: 'Base rent',
    amount: 650,
    notes: 'Weekly rent payment',
    label: 'Week 5 rent',
    evidenceUrl: 'https://example.com/income/2025-09-23-rent.pdf',
    evidenceName: '2025-09-23-rent.pdf',
  },
  {
    id: 'inc-2025-09-24-late-fee',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-24',
    category: 'Late fee',
    amount: 45,
    notes: 'Fee for late utilities reimbursement.',
    label: 'Utilities late fee',
    evidenceUrl: 'https://example.com/income/2025-09-24-late-fee.pdf',
    evidenceName: '2025-09-24-late-fee.pdf',
  },
  {
    id: 'inc-2025-09-25-grant',
    propertyId: '1',
    tenantId: 'tenant1',
    date: '2025-09-25',
    category: 'Government grant/subsidy',
    amount: 140,
    notes: 'Local council sustainability rebate.',
    label: 'Sustainability grant',
    evidenceUrl: 'https://example.com/income/2025-09-25-grant.pdf',
    evidenceName: '2025-09-25-grant.pdf',
  },
  {
    id: 'inc-2025-09-01-oak-rent',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-01',
    category: 'Base rent',
    amount: 475,
    notes: 'Fortnight 1 rent from Bob Renter.',
    label: 'Week 1 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-01-rent.pdf',
    evidenceName: '2025-09-01-rent.pdf',
  },
  {
    id: 'inc-2025-09-02-oak-utilities',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-02',
    category: 'Utilities reimbursement',
    amount: 88,
    notes: 'Tenant reimbursed shared water usage.',
    label: 'Water reimbursement',
    evidenceUrl: 'https://example.com/income/oak/2025-09-02-utilities.pdf',
    evidenceName: '2025-09-02-utilities.pdf',
  },
  {
    id: 'inc-2025-09-03-oak-parking',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-03',
    category: 'Parking space rent',
    amount: 40,
    notes: 'Visitor parking licence billed to corporate tenant.',
    label: 'Visitor parking pass',
    evidenceUrl: 'https://example.com/income/oak/2025-09-03-parking.pdf',
    evidenceName: '2025-09-03-parking.pdf',
  },
  {
    id: 'inc-2025-09-04-oak-storage',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-04',
    category: 'Storage/garage rent',
    amount: 50,
    notes: 'Storage cage rental for seasonal items.',
    label: 'Storage cage hire',
    evidenceUrl: 'https://example.com/income/oak/2025-09-04-storage.pdf',
    evidenceName: '2025-09-04-storage.pdf',
  },
  {
    id: 'inc-2025-09-05-oak-cleaning',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-05',
    category: 'Short-stay cleaning/host fee',
    amount: 95,
    notes: 'Cleaning fee charged back after guest stay.',
    label: 'Guest cleaning',
    evidenceUrl: 'https://example.com/income/oak/2025-09-05-cleaning.pdf',
    evidenceName: '2025-09-05-cleaning.pdf',
  },
  {
    id: 'inc-2025-09-06-oak-insurance-damage',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-06',
    category: 'Insurance payout – damage',
    amount: 260,
    notes: 'Insurer reimbursed patio awning repair.',
    label: 'Damage claim payout',
    evidenceUrl: 'https://example.com/income/oak/2025-09-06-insurance.pdf',
    evidenceName: '2025-09-06-insurance.pdf',
  },
  {
    id: 'inc-2025-09-07-oak-arrears',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-07',
    category: 'Arrears catch-up',
    amount: 180,
    notes: 'Cleared balance from August rent shortfall.',
    label: 'August arrears catch-up',
    evidenceUrl: 'https://example.com/income/oak/2025-09-07-arrears.pdf',
    evidenceName: '2025-09-07-arrears.pdf',
  },
  {
    id: 'inc-2025-09-08-oak-rent',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-08',
    category: 'Base rent',
    amount: 475,
    notes: 'Fortnight 2 rent received ahead of due date.',
    label: 'Week 2 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-08-rent.pdf',
    evidenceName: '2025-09-08-rent.pdf',
  },
  {
    id: 'inc-2025-09-09-oak-repairs',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-09',
    category: 'Repairs reimbursement',
    amount: 90,
    notes: 'Reimbursed for garden reticulation timer replacement.',
    label: 'Garden timer reimbursement',
    evidenceUrl: 'https://example.com/income/oak/2025-09-09-repairs.pdf',
    evidenceName: '2025-09-09-repairs.pdf',
  },
  {
    id: 'inc-2025-09-10-oak-grant',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-10',
    category: 'Government grant/subsidy',
    amount: 140,
    notes: 'NSW sustainability rebate credited to owner.',
    label: 'Sustainability rebate',
    evidenceUrl: 'https://example.com/income/oak/2025-09-10-grant.pdf',
    evidenceName: '2025-09-10-grant.pdf',
  },
  {
    id: 'inc-2025-09-11-oak-late-fee',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-11',
    category: 'Late fee',
    amount: 45,
    notes: 'Charged after utilities reimbursement overdue.',
    label: 'Utilities late fee',
    evidenceUrl: 'https://example.com/income/oak/2025-09-11-late-fee.pdf',
    evidenceName: '2025-09-11-late-fee.pdf',
  },
  {
    id: 'inc-2025-09-12-oak-pet',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-12',
    category: 'Miscellaneous income',
    amount: 85,
    notes: 'Monthly pet rent for approved small dog.',
    label: 'Pet rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-12-pet.pdf',
    evidenceName: '2025-09-12-pet.pdf',
  },
  {
    id: 'inc-2025-09-13-oak-misc',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-13',
    category: 'Miscellaneous income',
    amount: 70,
    notes: 'Laundry machine coin sweep for Oak Ave duplex.',
    label: 'Laundry income',
    evidenceUrl: 'https://example.com/income/oak/2025-09-13-misc.pdf',
    evidenceName: '2025-09-13-misc.pdf',
  },
  {
    id: 'inc-2025-09-14-oak-utilities',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-14',
    category: 'Utilities reimbursement',
    amount: 92,
    notes: 'Gas usage reimbursement for winter heating.',
    label: 'Gas reimbursement',
    evidenceUrl: 'https://example.com/income/oak/2025-09-14-utilities.pdf',
    evidenceName: '2025-09-14-utilities.pdf',
  },
  {
    id: 'inc-2025-09-15-oak-rent',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-15',
    category: 'Base rent',
    amount: 475,
    notes: 'Fortnight 3 rent deposit received.',
    label: 'Week 3 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-15-rent.pdf',
    evidenceName: '2025-09-15-rent.pdf',
  },
  {
    id: 'inc-2025-09-16-oak-repairs',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-16',
    category: 'Repairs reimbursement',
    amount: 135,
    notes: 'Reimbursed emergency plumber attendance fee.',
    label: 'Plumber reimbursement',
    evidenceUrl: 'https://example.com/income/oak/2025-09-16-repairs.pdf',
    evidenceName: '2025-09-16-repairs.pdf',
  },
  {
    id: 'inc-2025-09-17-oak-parking',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-17',
    category: 'Parking space rent',
    amount: 40,
    notes: 'Trades parking allocation billed during gutter works.',
    label: 'Trades parking',
    evidenceUrl: 'https://example.com/income/oak/2025-09-17-parking.pdf',
    evidenceName: '2025-09-17-parking.pdf',
  },
  {
    id: 'inc-2025-09-18-oak-insurance',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-18',
    category: 'Insurance payout – rent default',
    amount: 300,
    notes: 'Insurance covered partial rent during July hardship.',
    label: 'Rent default cover',
    evidenceUrl: 'https://example.com/income/oak/2025-09-18-insurance.pdf',
    evidenceName: '2025-09-18-insurance.pdf',
  },
  {
    id: 'inc-2025-09-19-oak-cleaning',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-19',
    category: 'Short-stay cleaning/host fee',
    amount: 105,
    notes: 'Mid-stay cleaning billed to tenant hosting guests.',
    label: 'Mid-stay clean',
    evidenceUrl: 'https://example.com/income/oak/2025-09-19-cleaning.pdf',
    evidenceName: '2025-09-19-cleaning.pdf',
  },
  {
    id: 'inc-2025-09-20-oak-storage',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-20',
    category: 'Storage/garage rent',
    amount: 50,
    notes: 'Additional storage bay for surfboards.',
    label: 'Garage bay hire',
    evidenceUrl: 'https://example.com/income/oak/2025-09-20-storage.pdf',
    evidenceName: '2025-09-20-storage.pdf',
  },
  {
    id: 'inc-2025-09-21-oak-misc',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-21',
    category: 'Miscellaneous income',
    amount: 65,
    notes: 'Key replacement fee billed after lost spare.',
    label: 'Key replacement',
    evidenceUrl: 'https://example.com/income/oak/2025-09-21-misc.pdf',
    evidenceName: '2025-09-21-misc.pdf',
  },
  {
    id: 'inc-2025-09-22-oak-grant',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-22',
    category: 'Government grant/subsidy',
    amount: 110,
    notes: 'Solar feed-in credit applied to owner statement.',
    label: 'Solar credit',
    evidenceUrl: 'https://example.com/income/oak/2025-09-22-grant.pdf',
    evidenceName: '2025-09-22-grant.pdf',
  },
  {
    id: 'inc-2025-09-23-oak-rent',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-23',
    category: 'Base rent',
    amount: 475,
    notes: 'Fortnight 4 rent received via bank transfer.',
    label: 'Week 4 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-23-rent.pdf',
    evidenceName: '2025-09-23-rent.pdf',
  },
  {
    id: 'inc-2025-09-24-oak-late-fee',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-24',
    category: 'Late fee',
    amount: 35,
    notes: 'Fee applied for late garden reimbursement.',
    label: 'Garden late fee',
    evidenceUrl: 'https://example.com/income/oak/2025-09-24-late-fee.pdf',
    evidenceName: '2025-09-24-late-fee.pdf',
  },
  {
    id: 'inc-2025-09-25-oak-utilities',
    propertyId: '2',
    tenantId: 'tenant2',
    date: '2025-09-25',
    category: 'Utilities reimbursement',
    amount: 86,
    notes: 'Electricity usage for smart irrigation system.',
    label: 'Electricity reimbursement',
    evidenceUrl: 'https://example.com/income/oak/2025-09-25-utilities.pdf',
    evidenceName: '2025-09-25-utilities.pdf',
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
    dueTime: '09:00',
    recurrence: 'One-off',
    severity: 'high',
    documents: [
      {
        id: 'rem1-doc1',
        name: 'Lease agreement',
        url: 'https://example.com/docs/lease-agreement.pdf',
      },
    ],
    checklist: [
      { id: 'rem1-check1', text: 'Confirm renewal intentions' },
      { id: 'rem1-check2', text: 'Send renewal paperwork' },
    ],
  },
  {
    id: 'rem2',
    propertyId: '2',
    type: 'rent_review',
    title: 'Rent review',
    dueDate: '2025-09-20',
    dueTime: '10:00',
    recurrence: 'Annual',
    severity: 'med',
    documents: [],
    checklist: [{ id: 'rem2-check1', text: 'Compare local market rents' }],
  },
  {
    id: 'rem3',
    propertyId: '3',
    type: 'insurance_renewal',
    title: 'Insurance renewal',
    dueDate: '2025-10-10',
    dueTime: '12:00',
    recurrence: 'Annual',
    severity: 'low',
    documents: [],
    checklist: [],
  },
  {
    id: 'rem4',
    propertyId: '1',
    type: 'inspection_due',
    title: 'Inspection due',
    dueDate: '2025-11-05',
    dueTime: '15:30',
    recurrence: 'Quarterly',
    severity: 'low',
    documents: [],
    checklist: [{ id: 'rem4-check1', text: 'Notify tenants of inspection' }],
  },
  {
    id: 'rem5',
    propertyId: '2',
    type: 'custom',
    title: 'Smoke alarm check',
    dueDate: '2025-07-30',
    dueTime: '08:00',
    recurrence: 'Annual',
    severity: 'med',
    documents: [
      {
        id: 'rem5-doc1',
        name: 'Alarm service certificate',
      },
    ],
    checklist: [
      { id: 'rem5-check1', text: 'Book technician' },
      { id: 'rem5-check2', text: 'Record compliance certificate' },
    ],
  },
];

const initialTasks: TaskDto[] = [
  {
    id: 'task-action-button-transitions',
    title: 'Action Button Transitions',
    description:
      'Backlog change request to smooth the appearance and disappearance of action button popups.',
    cadence: 'Immediate',
    properties: [],
    status: 'todo',
    priority: 'normal',
    tags: ['change-request', 'backlog'],
    createdAt: '2025-09-26T12:51:00.000Z',
    updatedAt: '2025-09-26T12:51:00.000Z',
  },
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
  {
    id: 'rent1-2025-09-01',
    propertyId: '1',
    tenantId: 'tenant1',
    amount: 650,
    dueDate: '2025-09-01',
    status: 'paid',
    paidDate: '2025-09-01',
    description: 'Week 1 rent',
    evidenceUrl: 'https://example.com/income/2025-09-01-rent.pdf',
    evidenceName: '2025-09-01-rent.pdf',
  },
  {
    id: 'rent1-2025-09-02',
    propertyId: '1',
    tenantId: 'tenant1',
    amount: 650,
    dueDate: '2025-09-02',
    status: 'paid',
    paidDate: '2025-09-02',
    description: 'Week 2 rent',
    evidenceUrl: 'https://example.com/income/2025-09-02-rent.pdf',
    evidenceName: '2025-09-02-rent.pdf',
  },
  {
    id: 'rent1-2025-09-09',
    propertyId: '1',
    tenantId: 'tenant1',
    amount: 650,
    dueDate: '2025-09-09',
    status: 'paid',
    paidDate: '2025-09-09',
    description: 'Week 3 rent',
    evidenceUrl: 'https://example.com/income/2025-09-09-rent.pdf',
    evidenceName: '2025-09-09-rent.pdf',
  },
  {
    id: 'rent1-2025-09-14-arrears',
    propertyId: '1',
    tenantId: 'tenant1',
    amount: 320,
    dueDate: '2025-09-14',
    status: 'paid',
    paidDate: '2025-09-14',
    description: 'Arrears catch-up',
    evidenceUrl: 'https://example.com/income/2025-09-14-arrears.pdf',
    evidenceName: '2025-09-14-arrears.pdf',
  },
  {
    id: 'rent1-2025-09-16',
    propertyId: '1',
    tenantId: 'tenant1',
    amount: 650,
    dueDate: '2025-09-16',
    status: 'paid',
    paidDate: '2025-09-16',
    description: 'Week 4 rent',
    evidenceUrl: 'https://example.com/income/2025-09-16-rent.pdf',
    evidenceName: '2025-09-16-rent.pdf',
  },
  {
    id: 'rent1-2025-09-23',
    propertyId: '1',
    tenantId: 'tenant1',
    amount: 650,
    dueDate: '2025-09-23',
    status: 'paid',
    paidDate: '2025-09-23',
    description: 'Week 5 rent',
    evidenceUrl: 'https://example.com/income/2025-09-23-rent.pdf',
    evidenceName: '2025-09-23-rent.pdf',
  },
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
  {
    id: 'rent2-2025-09-01',
    propertyId: '2',
    tenantId: 'tenant2',
    amount: 475,
    dueDate: '2025-09-01',
    status: 'paid',
    paidDate: '2025-09-01',
    description: 'Week 1 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-01-rent.pdf',
    evidenceName: '2025-09-01-rent.pdf',
  },
  {
    id: 'rent2-2025-09-07-arrears',
    propertyId: '2',
    tenantId: 'tenant2',
    amount: 180,
    dueDate: '2025-09-07',
    status: 'paid',
    paidDate: '2025-09-07',
    description: 'August arrears catch-up',
    evidenceUrl: 'https://example.com/income/oak/2025-09-07-arrears.pdf',
    evidenceName: '2025-09-07-arrears.pdf',
  },
  {
    id: 'rent2-2025-09-08',
    propertyId: '2',
    tenantId: 'tenant2',
    amount: 475,
    dueDate: '2025-09-08',
    status: 'paid',
    paidDate: '2025-09-08',
    description: 'Week 2 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-08-rent.pdf',
    evidenceName: '2025-09-08-rent.pdf',
  },
  {
    id: 'rent2-2025-09-15',
    propertyId: '2',
    tenantId: 'tenant2',
    amount: 475,
    dueDate: '2025-09-15',
    status: 'paid',
    paidDate: '2025-09-15',
    description: 'Week 3 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-15-rent.pdf',
    evidenceName: '2025-09-15-rent.pdf',
  },
  {
    id: 'rent2-2025-09-23',
    propertyId: '2',
    tenantId: 'tenant2',
    amount: 475,
    dueDate: '2025-09-23',
    status: 'paid',
    paidDate: '2025-09-23',
    description: 'Week 4 rent',
    evidenceUrl: 'https://example.com/income/oak/2025-09-23-rent.pdf',
    evidenceName: '2025-09-23-rent.pdf',
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

const cloneReminderDocuments = (docs?: ReminderDocument[]) =>
  docs?.map((doc) => ({ ...doc })) ?? [];

const cloneReminderChecklist = (items?: ReminderChecklistItem[]) =>
  items?.map((item) => ({ ...item })) ?? [];

export const createReminder = (
  data: Omit<Reminder, 'id'> & Partial<Pick<Reminder, 'id'>>,
): Reminder => {
  const reminder: Reminder = {
    ...data,
    id: data.id ?? crypto.randomUUID(),
    recurrence: data.recurrence ?? null,
    documents: cloneReminderDocuments(data.documents),
    checklist: cloneReminderChecklist(data.checklist),
    taskId: data.taskId ?? null,
  };
  reminders.push(reminder);
  return reminder;
};

export const updateReminder = (
  id: string,
  data: Partial<Omit<Reminder, 'id'>>,
): Reminder | null => {
  const idx = reminders.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const current = reminders[idx];
  const updated: Reminder = {
    ...current,
    ...data,
    recurrence:
      data.recurrence !== undefined ? data.recurrence : current.recurrence ?? null,
    documents:
      data.documents !== undefined
        ? cloneReminderDocuments(data.documents)
        : current.documents,
    checklist:
      data.checklist !== undefined
        ? cloneReminderChecklist(data.checklist)
        : current.checklist,
  };
  reminders[idx] = updated;
  return updated;
};

export const deleteReminder = (id: string): Reminder | null => {
  const idx = reminders.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const [removed] = reminders.splice(idx, 1);
  return removed ?? null;
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
