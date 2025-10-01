import { randomUUID } from 'crypto';

import type {
  CommLogEntry,
  NotificationPreference,
  Tenant,
  TenantNote,
  Tenancy,
} from '../../../lib/tenant-crm/schemas';

const now = () => new Date().toISOString();

const createInitialTenantDirectory = (): Tenant[] => {
  const timestamp = now();
  return [
    {
      id: 'tenant1',
      fullName: 'Alice Tenant',
      email: 'alice@example.com',
      phone: '+61 400 111 222',
      altContacts: [{ name: 'Bob Support', phone: '+61 400 333 444' }],
      tags: ['A-grade'],
      currentPropertyId: '1',
      currentTenancyId: 'tenancy1',
      riskFlags: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'tenant2',
      fullName: 'Bob Renter',
      email: 'bob@example.com',
      phone: '+61 400 555 666',
      tags: ['watchlist'],
      currentPropertyId: '2',
      currentTenancyId: 'tenancy2',
      riskFlags: ['arrears'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'tenant3',
      fullName: 'Charlie Prospect',
      tags: ['prospect'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

const createInitialTenancySummaries = (): Tenancy[] => [
  {
    id: 'tenancy1',
    tenantId: 'tenant1',
    propertyId: '1',
    leaseId: 'lease1',
    startDate: '2024-01-01',
    rentCents: 120000,
    frequency: 'MONTHLY',
    status: 'ACTIVE',
    bondCents: 400000,
  },
  {
    id: 'tenancy2',
    tenantId: 'tenant2',
    propertyId: '2',
    leaseId: 'lease2',
    startDate: '2023-12-01',
    rentCents: 95000,
    frequency: 'MONTHLY',
    status: 'ACTIVE',
  },
];

const createInitialTenantNotes = (): TenantNote[] => [
  {
    id: 'note1',
    tenantId: 'tenant1',
    tenancyId: 'tenancy1',
    propertyId: '1',
    createdAt: now(),
    createdByUserId: 'user1',
    body: 'Tenant called to confirm maintenance access.',
    tags: ['maintenance'],
  },
];

const createInitialCommLogStore = (): CommLogEntry[] => [
  {
    id: 'comm1',
    tenantId: 'tenant2',
    tenancyId: 'tenancy2',
    type: 'CALL',
    direction: 'OUT',
    when: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    subject: 'Follow up rent',
    body: 'Discussed outstanding rent, agreed to pay Friday.',
  },
];

const createInitialNotificationPreferences = (): NotificationPreference[] => [
  {
    id: 'pref1',
    tenantId: 'tenant1',
    channels: { email: true, sms: true, push: false },
  },
];

export const tenantDirectory: Tenant[] = createInitialTenantDirectory();
export const tenancySummaries: Tenancy[] = createInitialTenancySummaries();
export const tenantNotesStore: TenantNote[] = createInitialTenantNotes();
export const commLogStore: CommLogEntry[] = createInitialCommLogStore();
export const notificationPreferenceStore: NotificationPreference[] =
  createInitialNotificationPreferences();

export const resetTenantCrmStore = () => {
  tenantDirectory.splice(0, tenantDirectory.length, ...createInitialTenantDirectory());
  tenancySummaries.splice(0, tenancySummaries.length, ...createInitialTenancySummaries());
  tenantNotesStore.splice(0, tenantNotesStore.length, ...createInitialTenantNotes());
  commLogStore.splice(0, commLogStore.length, ...createInitialCommLogStore());
  notificationPreferenceStore.splice(
    0,
    notificationPreferenceStore.length,
    ...createInitialNotificationPreferences()
  );
};

export function nextId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}
