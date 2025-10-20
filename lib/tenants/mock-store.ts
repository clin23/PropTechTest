import { randomUUID } from 'crypto';

import type {
  LedgerEntry,
  MaintenanceJob,
  SavedFilterSet,
  TenantFile,
  TenantNote,
  TenantTask,
  TenantWorkspace,
  TimelineEventBase,
  TenantTag,
} from './types';

type TenantStoreRecord = TenantWorkspace;

const tenantStore = new Map<string, TenantStoreRecord>();
const savedFilters = new Map<string, SavedFilterSet[]>();

seed();

function seed() {
  tenantStore.clear();
  const now = new Date();
  const toISO = (date: Date) => date.toISOString();

  const alice: TenantStoreRecord = {
    summary: {
      id: 'tenant-alice',
      name: 'Alice Tenant',
      email: 'alice@example.com',
      phone: '+61 400 111 222',
      tags: ['A-GRADE'],
      lastTouchpointAt: toISO(new Date(now.getTime() - 1000 * 60 * 90)),
      currentTenancy: {
        propertyId: 'property-1',
        propertyLabel: '12 Sunset Way',
        rentCents: 120000,
        frequency: 'MONTHLY',
        since: toISO(new Date(now.getFullYear(), 0, 12)),
      },
      arrears: null,
      address: '12 Sunset Way, Carlton',
      avatarInitials: 'AT',
      healthScore: 92,
      watchlist: false,
    },
    arrearsCard: null,
    upcomingEvents: [
      {
        id: 'evt-alice-1',
        label: 'Routine inspection',
        type: 'inspection',
        date: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 18)),
      },
    ],
    guidedActions: [
      {
        id: 'guide-alice-1',
        title: 'Schedule six-month check-in',
        description: 'Send a quick SMS to confirm how the tenancy is tracking.',
        cta: 'Draft SMS',
      },
      {
        id: 'guide-alice-2',
        title: 'Upload signed renewal',
        description: 'The renewal document is waiting in your downloads.',
        cta: 'Upload',
      },
    ],
    timeline: [
      createTimelineEvent('tenant-alice', 'NOTE', new Date(now.getTime() - 1000 * 60 * 45), {
        summary: 'Added note “Confirmed access for electrician”',
        description: 'Tenant confirmed access window 8–11am next Tuesday.',
      }),
      createTimelineEvent('tenant-alice', 'PAYMENT', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), {
        summary: 'Recorded rent payment $1,200',
        description: 'Payment reconciled in ledger by Ava Property Manager.',
      }),
    ],
    notes: [
      {
        id: 'note-alice-1',
        tenantId: 'tenant-alice',
        author: 'Ava Property Manager',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 45)),
        body: 'Tenant confirmed access window for electrician next Tuesday between 8-11am. Reminder to send contractor details Friday.',
        tags: ['maintenance'],
      },
    ],
    tenancies: [
      {
        id: 'tenancy-alice-current',
        tenantId: 'tenant-alice',
        propertyId: 'property-1',
        propertyLabel: '12 Sunset Way',
        startDate: toISO(new Date(now.getFullYear(), 0, 12)),
        rentCents: 120000,
        frequency: 'MONTHLY',
        bondCents: 480000,
        escalations: [
          { effectiveDate: toISO(new Date(now.getFullYear(), 6, 1)), amountCents: 5000 },
        ],
      },
    ],
    ledger: [
      createLedger('tenant-alice', 'RENT', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 32), 120000, 'Rent invoice Feb'),
      createLedger('tenant-alice', 'PAYMENT', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 27), 120000, 'Payment via bank transfer'),
      createLedger('tenant-alice', 'RENT', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), 120000, 'Rent invoice Mar'),
    ],
    inspections: [
      {
        id: 'inspection-alice-1',
        tenantId: 'tenant-alice',
        scheduledFor: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 18)),
        type: 'ROUTINE',
        status: 'UPCOMING',
        template: 'Routine - 2025',
        followUps: ['Send reminder 3 days prior'],
      },
      {
        id: 'inspection-alice-prev',
        tenantId: 'tenant-alice',
        scheduledFor: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 92)),
        type: 'ROUTINE',
        status: 'COMPLETED',
        findings: 'Excellent condition, no maintenance required.',
        photos: ['https://placehold.co/320x180'],
      },
    ],
    tasks: [
      {
        id: 'task-alice-1',
        tenantId: 'tenant-alice',
        title: 'Send contractor details for electrical check',
        status: 'IN_PROGRESS',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 30)),
        dueAt: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24)),
        reminders: [toISO(new Date(now.getTime() + 1000 * 60 * 60 * 12))],
      },
    ],
    maintenance: [
      {
        id: 'job-alice-1',
        tenantId: 'tenant-alice',
        title: 'Smoke alarm annual service',
        status: 'SCHEDULED',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 48)),
        vendor: { name: 'SafeHome Electrical', phone: '+61 3 7000 0000' },
        costCents: 8900,
        attachments: [],
      },
    ],
    files: [
      {
        id: 'file-alice-lease',
        tenantId: 'tenant-alice',
        name: 'Lease Agreement 2025.pdf',
        uploadedAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 28)),
        version: 2,
        previewUrl: 'https://placehold.co/120x160',
      },
    ],
    preferences: {
      tenantId: 'tenant-alice',
      notificationChannels: { email: true, sms: true, phone: false },
      consent: { marketing: false, sms: true, email: true },
      privacyFlags: ['Do not call after 6pm'],
      communicationCadence: 'MONTHLY',
      preferredPaymentDay: 1,
    },
  } as TenantStoreRecord;

  const bobArrears = {
    balanceCents: 28500,
    daysLate: 8,
    lastPaymentAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 16)),
    nextStep: { label: 'Send formal reminder', action: 'FORMAL_REMINDER' as const },
  };

  const bob: TenantStoreRecord = {
    summary: {
      id: 'tenant-bob',
      name: 'Bob Renter',
      email: 'bob@example.com',
      phone: '+61 400 333 444',
      tags: ['WATCHLIST', 'ARREARS'],
      lastTouchpointAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
      arrears: { amountCents: bobArrears.balanceCents, daysLate: bobArrears.daysLate },
      currentTenancy: {
        propertyId: 'property-2',
        propertyLabel: '88 Harbour Street',
        rentCents: 95000,
        frequency: 'FORTNIGHTLY',
        since: toISO(new Date(now.getFullYear(), 2, 2)),
      },
      address: '88 Harbour Street, Southbank',
      avatarInitials: 'BR',
      healthScore: 54,
      watchlist: true,
    },
    arrearsCard: bobArrears,
    upcomingEvents: [
      {
        id: 'evt-bob-1',
        label: 'Arrears follow up',
        type: 'task',
        date: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2)),
      },
      {
        id: 'evt-bob-2',
        label: 'Inspection due',
        type: 'inspection',
        date: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 12)),
      },
    ],
    guidedActions: [
      {
        id: 'guide-bob-1',
        title: 'Trigger arrears workflow',
        description: 'Send the formal reminder template to keep pace with policy.',
        cta: 'Send reminder',
      },
      {
        id: 'guide-bob-2',
        title: 'Schedule inspection',
        description: 'Inspection is due within two weeks. Offer two time windows.',
        cta: 'Schedule now',
      },
    ],
    timeline: [
      createTimelineEvent('tenant-bob', 'MESSAGE', new Date(now.getTime() - 1000 * 60 * 60 * 6), {
        summary: 'Sent SMS arrears reminder',
        description: 'Automated SMS: “Hi Bob, rent is overdue by 7 days. Please make a payment or contact us.”',
      }),
      createTimelineEvent('tenant-bob', 'LEDGER', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 16), {
        summary: 'Recorded part payment $500',
        description: 'Payment applied to outstanding rent, balance remaining.',
      }),
      createTimelineEvent('tenant-bob', 'MAINTENANCE', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 28), {
        summary: 'Maintenance job “Leaking tap” closed',
      }),
    ],
    notes: [
      {
        id: 'note-bob-1',
        tenantId: 'tenant-bob',
        author: 'Jordan Field Agent',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 8)),
        body: 'Called tenant about arrears. Confirmed they will pay $500 today and remainder Friday.',
        tags: ['arrears'],
        pinned: true,
      },
    ],
    tenancies: [
      {
        id: 'tenancy-bob-current',
        tenantId: 'tenant-bob',
        propertyId: 'property-2',
        propertyLabel: '88 Harbour Street',
        startDate: toISO(new Date(now.getFullYear(), 1, 1)),
        rentCents: 95000,
        frequency: 'FORTNIGHTLY',
        bondCents: 380000,
      },
    ],
    ledger: [
      createLedger('tenant-bob', 'RENT', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20), 95000, 'Rent invoice 14 Mar'),
      createLedger('tenant-bob', 'PAYMENT', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 16), 50000, 'Part payment via bank transfer'),
      createLedger('tenant-bob', 'EXPENSE', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10), -12000, 'Water usage deduction'),
    ],
    inspections: [
      {
        id: 'inspection-bob-1',
        tenantId: 'tenant-bob',
        scheduledFor: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 12)),
        type: 'ROUTINE',
        status: 'UPCOMING',
      },
    ],
    tasks: [
      {
        id: 'task-bob-1',
        tenantId: 'tenant-bob',
        title: 'Follow up arrears payment',
        status: 'WAITING',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 20)),
        dueAt: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2)),
      },
      {
        id: 'task-bob-2',
        tenantId: 'tenant-bob',
        title: 'Draft breach notice (if unpaid)',
        status: 'TODO',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 12)),
      },
    ],
    maintenance: [
      {
        id: 'job-bob-1',
        tenantId: 'tenant-bob',
        title: 'Leaking tap – bathroom',
        status: 'COMPLETED',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)),
        updatedAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 28)),
        vendor: { name: 'ClearFlow Plumbing', phone: '+61 3 9000 1111' },
        costCents: 14500,
      },
    ],
    files: [
      {
        id: 'file-bob-rent-receipt',
        tenantId: 'tenant-bob',
        name: 'Rent receipt Feb.pdf',
        uploadedAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 18)),
        version: 1,
      },
    ],
    preferences: {
      tenantId: 'tenant-bob',
      notificationChannels: { email: true, sms: true, phone: true },
      consent: { marketing: false, sms: true, email: true },
      privacyFlags: ['Sensitive to calls during work hours'],
      communicationCadence: 'WEEKLY',
      preferredPaymentDay: 5,
    },
  } as TenantStoreRecord;

  const charlie: TenantStoreRecord = {
    summary: {
      id: 'tenant-charlie',
      name: 'Charlie Prospect',
      email: 'charlie@example.com',
      phone: '+61 400 777 555',
      tags: ['PROSPECT', 'NEW'],
      lastTouchpointAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 2)),
      currentTenancy: null,
      arrears: null,
      address: 'Prospect lead',
      avatarInitials: 'CP',
      healthScore: 68,
      watchlist: false,
    },
    arrearsCard: null,
    upcomingEvents: [
      {
        id: 'evt-charlie-1',
        label: 'Application review',
        type: 'task',
        date: toISO(new Date(now.getTime() + 1000 * 60 * 60 * 24)),
      },
    ],
    guidedActions: [
      {
        id: 'guide-charlie-1',
        title: 'Send welcome pack',
        description: 'Upload the welcome information PDF so it is ready for onboarding.',
        cta: 'Upload pack',
      },
    ],
    timeline: [
      createTimelineEvent('tenant-charlie', 'MESSAGE', new Date(now.getTime() - 1000 * 60 * 60 * 2), {
        summary: 'Received enquiry about Unit 18',
        description: 'Charlie asked about availability from next month.',
      }),
    ],
    notes: [
      {
        id: 'note-charlie-1',
        tenantId: 'tenant-charlie',
        author: 'Taylor Leasing',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 1.5)),
        body: 'Prospect is relocating for work, has dog (medium). Prefers Saturday inspections.',
        tags: ['prospect'],
      },
    ],
    tenancies: [],
    ledger: [],
    inspections: [],
    tasks: [
      {
        id: 'task-charlie-1',
        tenantId: 'tenant-charlie',
        title: 'Collect supporting documents',
        status: 'TODO',
        createdAt: toISO(new Date(now.getTime() - 1000 * 60 * 60)),
      },
    ],
    maintenance: [],
    files: [],
    preferences: {
      tenantId: 'tenant-charlie',
      notificationChannels: { email: true, sms: false, phone: true },
      consent: { marketing: true, sms: true, email: true },
      privacyFlags: [],
      communicationCadence: 'ADHOC',
    },
  } as TenantStoreRecord;

  [alice, bob, charlie].forEach((record) => {
    tenantStore.set(record.summary.id, record);
  });
}

function createTimelineEvent(
  tenantId: string,
  type: TimelineEventBase['type'],
  date: Date,
  { summary, description }: { summary: string; description?: string }
): TimelineEventBase {
  return {
    id: `timeline-${randomUUID()}`,
    tenantId,
    type,
    occurredAt: date.toISOString(),
    summary,
    description,
  };
}

function createLedger(
  tenantId: string,
  type: LedgerEntry['type'],
  date: Date,
  amountCents: number,
  note: string
): LedgerEntry {
  return {
    id: `ledger-${randomUUID()}`,
    tenantId,
    type,
    date: date.toISOString(),
    amountCents,
    note,
  };
}

export interface TenantListOptions {
  q?: string;
  tags?: TenantTag[];
  limit?: number;
  cursor?: string;
  arrearsOnly?: boolean;
}

export function listTenants({ q, tags, limit = 20, cursor, arrearsOnly }: TenantListOptions) {
  const tenants = Array.from(tenantStore.values());
  const filtered = tenants.filter((tenant) => {
    const summary = tenant.summary;
    if (arrearsOnly && !summary.arrears) return false;
    if (tags && tags.length > 0) {
      const match = tags.some((tag) => summary.tags.includes(tag));
      if (!match) return false;
    }
    if (q) {
      const value = q.toLowerCase();
      const haystack = [summary.name, summary.email, summary.phone, summary.currentTenancy?.propertyLabel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(value)) {
        return false;
      }
    }
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const aTime = a.summary.lastTouchpointAt ? Date.parse(a.summary.lastTouchpointAt) : 0;
    const bTime = b.summary.lastTouchpointAt ? Date.parse(b.summary.lastTouchpointAt) : 0;
    return bTime - aTime;
  });

  let startIndex = 0;
  if (cursor) {
    const index = sorted.findIndex((item) => item.summary.id === cursor);
    if (index >= 0) {
      startIndex = index + 1;
    }
  }

  const slice = sorted.slice(startIndex, startIndex + limit);
  const nextCursor = slice.length === limit ? slice[slice.length - 1].summary.id : undefined;

  return {
    items: slice.map((record) => record.summary),
    nextCursor,
  };
}

export function getTenantWorkspace(id: string): TenantWorkspace | undefined {
  return tenantStore.get(id);
}

export function recordNote(
  tenantId: string,
  input: { body: string; tags: string[]; author: string }
): TenantNote {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const note: TenantNote = {
    id: `note-${randomUUID()}`,
    tenantId,
    author: input.author,
    createdAt: new Date().toISOString(),
    body: input.body,
    tags: input.tags,
  };
  tenant.notes = [note, ...tenant.notes];
  tenant.timeline = [
    createTimelineEvent(tenantId, 'NOTE', new Date(), {
      summary: `New note by ${input.author}`,
      description: input.body.slice(0, 140),
    }),
    ...tenant.timeline,
  ];
  return note;
}

export function recordTask(
  tenantId: string,
  input: { title: string; dueAt?: string; status?: TenantTask['status']; assignee?: string }
): TenantTask {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const task: TenantTask = {
    id: `task-${randomUUID()}`,
    tenantId,
    title: input.title,
    status: input.status ?? 'TODO',
    dueAt: input.dueAt,
    assignee: input.assignee,
    createdAt: new Date().toISOString(),
  };
  tenant.tasks = [task, ...tenant.tasks];
  tenant.timeline = [
    createTimelineEvent(tenantId, 'TASK', new Date(), {
      summary: `Created task “${input.title}”`,
    }),
    ...tenant.timeline,
  ];
  return task;
}

export function recordLedgerEntry(
  tenantId: string,
  input: { type: LedgerEntry['type']; amountCents: number; note?: string }
): LedgerEntry {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  const entry: LedgerEntry = {
    id: `ledger-${randomUUID()}`,
    tenantId,
    type: input.type,
    amountCents: input.amountCents,
    note: input.note,
    date: new Date().toISOString(),
  };
  tenant.ledger = [entry, ...tenant.ledger];
  tenant.timeline = [
    createTimelineEvent(tenantId, 'LEDGER', new Date(), {
      summary: `Recorded ${entry.type.toLowerCase()} ${formatCurrency(entry.amountCents)}`,
      description: input.note,
    }),
    ...tenant.timeline,
  ];
  if (tenant.arrearsCard) {
    const adjustment = entry.type === 'PAYMENT' ? -entry.amountCents : entry.amountCents;
    tenant.arrearsCard.balanceCents += adjustment;
    if (tenant.arrearsCard.balanceCents <= 0) {
      tenant.arrearsCard = null;
      tenant.summary.arrears = null;
    } else {
      tenant.summary.arrears = {
        amountCents: tenant.arrearsCard.balanceCents,
        daysLate: tenant.arrearsCard.daysLate,
      };
    }
  }
  return entry;
}

export function recordMaintenance(
  tenantId: string,
  input: { title: string; vendorName?: string; status?: MaintenanceJob['status'] }
): MaintenanceJob {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  const job: MaintenanceJob = {
    id: `job-${randomUUID()}`,
    tenantId,
    title: input.title,
    status: input.status ?? 'NEW',
    createdAt: new Date().toISOString(),
    vendor: input.vendorName ? { name: input.vendorName } : undefined,
  };
  tenant.maintenance = [job, ...tenant.maintenance];
  tenant.timeline = [
    createTimelineEvent(tenantId, 'MAINTENANCE', new Date(), {
      summary: `Logged maintenance “${job.title}”`,
    }),
    ...tenant.timeline,
  ];
  return job;
}

export function recordCommunication(
  tenantId: string,
  input: { channel: 'CALL' | 'EMAIL' | 'SMS'; summary: string; body?: string }
): TimelineEventBase {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  const event = createTimelineEvent(tenantId, 'MESSAGE', new Date(), {
    summary: `${input.channel} – ${input.summary}`,
    description: input.body,
  });
  tenant.timeline = [event, ...tenant.timeline];
  tenant.summary.lastTouchpointAt = event.occurredAt;
  return event;
}

export function uploadFile(
  tenantId: string,
  input: { name: string; previewUrl?: string }
): TenantFile {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  const file: TenantFile = {
    id: `file-${randomUUID()}`,
    tenantId,
    name: input.name,
    uploadedAt: new Date().toISOString(),
    version: 1,
    previewUrl: input.previewUrl,
  };
  tenant.files = [file, ...tenant.files];
  tenant.timeline = [
    createTimelineEvent(tenantId, 'FILE', new Date(), {
      summary: `Uploaded ${input.name}`,
    }),
    ...tenant.timeline,
  ];
  return file;
}

export function suggestRentReview(
  tenantId: string,
  input: { basis: 'CPI' | 'PERCENT'; amount: number; effectiveDate: string }
) {
  const tenant = tenantStore.get(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  const timeline = createTimelineEvent(tenantId, 'TENANCY', new Date(), {
    summary: `Proposed rent review (${input.basis === 'CPI' ? 'CPI' : `${input.amount}%`})`,
    description: `Effective ${new Date(input.effectiveDate).toLocaleDateString()}`,
  });
  tenant.timeline = [timeline, ...tenant.timeline];
  tenant.guidedActions = tenant.guidedActions.filter((action) => action.id !== 'guide-bob-1');
  return timeline;
}

export function saveFilters(userId: string, filter: SavedFilterSet) {
  const list = savedFilters.get(userId) ?? [];
  const withoutExisting = list.filter((item) => item.id !== filter.id);
  savedFilters.set(userId, [...withoutExisting, filter]);
}

export function listSavedFilters(userId: string): SavedFilterSet[] {
  return savedFilters.get(userId) ?? [];
}

export function resetTenantStore() {
  seed();
  savedFilters.clear();
}

function formatCurrency(amountCents: number) {
  const amount = amountCents / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}
