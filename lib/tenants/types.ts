export type TenantStage = 'PROSPECT' | 'ACTIVE' | 'ENDING' | 'VACATING';

export type TenantTag =
  | 'A-GRADE'
  | 'WATCHLIST'
  | 'PROSPECT'
  | 'ARREARS'
  | 'INSPECTION_SOON'
  | 'VACATING'
  | 'NEW';

export interface TenantIndicators {
  unreadComms?: number;
  openTasks?: number;
  overdueCompliance?: boolean;
}

export interface TenantSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tags: TenantTag[];
  stage?: TenantStage;
  updatedAgo?: string;
  healthScore?: number;
  watchlist?: boolean;
  indicators?: TenantIndicators;
  lastTouchpointAt?: string;
  arrears?: { amountCents: number; daysLate: number } | null;
  currentTenancy?: {
    propertyId: string;
    propertyLabel: string;
    rentCents: number;
    frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
    since: string;
  } | null;
}

export interface LedgerEntry {
  id: string;
  tenantId: string;
  type: 'RENT' | 'PAYMENT' | 'EXPENSE' | 'ADJUSTMENT';
  amountCents: number;
  date: string;
  note?: string;
  attachmentId?: string;
}

export type TimelineEventType =
  | 'NOTE'
  | 'TASK'
  | 'MAINTENANCE'
  | 'PAYMENT'
  | 'MESSAGE'
  | 'FILE'
  | 'LEDGER'
  | 'INSPECTION'
  | 'TENANCY';

export interface TimelineEventBase {
  id: string;
  tenantId: string;
  occurredAt: string;
  type: TimelineEventType;
  summary: string;
  description?: string;
  meta?: Record<string, string>;
}

export interface TenantNote {
  id: string;
  tenantId: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  body: string;
  tags: string[];
  pinned?: boolean;
}

export interface TenantTask {
  id: string;
  tenantId: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'WAITING' | 'DONE';
  dueAt?: string;
  createdAt: string;
  assignee?: string;
  reminders?: string[];
}

export interface MaintenanceJob {
  id: string;
  tenantId: string;
  title: string;
  status: 'NEW' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
  vendor?: {
    name: string;
    phone?: string;
    email?: string;
  };
  costCents?: number;
  propertyId?: string;
  attachments?: string[];
}

export interface TenantFile {
  id: string;
  tenantId: string;
  name: string;
  uploadedAt: string;
  version: number;
  ocrText?: string;
  previewUrl?: string;
}

export interface TenancyRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  propertyLabel: string;
  startDate: string;
  endDate?: string;
  rentCents: number;
  frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
  bondCents?: number;
  escalations?: Array<{ effectiveDate: string; amountCents: number }>;
}

export interface InspectionRecord {
  id: string;
  tenantId: string;
  scheduledFor: string;
  type: 'ROUTINE' | 'ENTRY' | 'EXIT';
  template?: string;
  status: 'UPCOMING' | 'COMPLETED';
  findings?: string;
  photos?: string[];
  followUps?: string[];
}

export interface TenantPreferences {
  tenantId: string;
  notificationChannels: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  consent: {
    marketing: boolean;
    sms: boolean;
    email: boolean;
  };
  privacyFlags: string[];
  communicationCadence: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'ADHOC';
  preferredPaymentDay?: number;
}

export interface TenantWorkspace {
  summary: TenantSummary & {
    address?: string;
    avatarInitials: string;
    healthScore: number;
    watchlist?: boolean;
    healthBreakdown?: {
      paymentTimeliness: number;
      responseLatency: number;
      openJobs: number;
      compliance: number;
    };
  };
  arrearsCard: {
    balanceCents: number;
    daysLate: number;
    lastPaymentAt?: string;
    nextStep: {
      label: string;
      action: 'GENTLE_REMINDER' | 'FORMAL_REMINDER' | 'BREACH_NOTICE';
    } | null;
  } | null;
  upcomingEvents: Array<{ id: string; label: string; date: string; type: string }>;
  guidedActions: Array<{ id: string; title: string; description: string; cta: string }>;
  timeline: TimelineEventBase[];
  notes: TenantNote[];
  tenancies: TenancyRecord[];
  ledger: LedgerEntry[];
  inspections: InspectionRecord[];
  tasks: TenantTask[];
  maintenance: MaintenanceJob[];
  files: TenantFile[];
  preferences: TenantPreferences;
}

export interface SavedFilterSet {
  id: string;
  userId: string;
  name: string;
  query: {
    q?: string;
    tags?: TenantTag[];
    arrearsOnly?: boolean;
  };
  updatedAt: string;
}
