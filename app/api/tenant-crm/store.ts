import { randomUUID } from 'crypto';

import type {
  CommLogEntry,
  NotificationPreference,
  Tenant,
  TenantNote,
  Tenancy,
} from '../../../lib/tenant-crm/schemas';

const now = () => new Date().toISOString();

const tNow = now();

export const tenantDirectory: Tenant[] = [
  {
    id: 'tenant1',
    fullName: 'Alice Tenant',
    email: 'alice@example.com',
    phone: '+61 400 111 222',
    altContacts: [
      { name: 'Bob Support', phone: '+61 400 333 444' },
    ],
    tags: ['A-grade'],
    currentPropertyId: '1',
    currentTenancyId: 'tenancy1',
    riskFlags: [],
    createdAt: tNow,
    updatedAt: tNow,
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
    createdAt: tNow,
    updatedAt: tNow,
  },
  {
    id: 'tenant3',
    fullName: 'Charlie Prospect',
    tags: ['prospect'],
    createdAt: tNow,
    updatedAt: tNow,
  },
];

export const tenancySummaries: Tenancy[] = [
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

export const tenantNotesStore: TenantNote[] = [
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

export const commLogStore: CommLogEntry[] = [
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

export const notificationPreferenceStore: NotificationPreference[] = [
  {
    id: 'pref1',
    tenantId: 'tenant1',
    channels: { email: true, sms: true, push: false },
  },
];

export function nextId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}
