import { z } from 'zod';

export const zTenantAltContact = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const zTenant = z.object({
  id: z.string(),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  altContacts: z.array(zTenantAltContact).default([]),
  tags: z.array(z.string()).default([]),
  currentPropertyId: z.string().nullable().optional(),
  currentTenancyId: z.string().nullable().optional(),
  riskFlags: z
    .array(z.enum(['arrears', 'complaint', 'vulnerable']))
    .default([])
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const zTenantCreate = zTenant
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    fullName: z.string().min(1),
  })
  .partial({
    tags: true,
    altContacts: true,
    riskFlags: true,
    currentPropertyId: true,
    currentTenancyId: true,
  });

export const zTenantUpdate = zTenantCreate.partial().extend({
  fullName: z.string().min(1).optional(),
});

export const zTenancy = z.object({
  id: z.string(),
  propertyId: z.string(),
  tenantId: z.string(),
  leaseId: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  rentCents: z.number().int().nonnegative(),
  frequency: z.enum(['WEEKLY', 'FORTNIGHTLY', 'MONTHLY']),
  status: z.enum(['ACTIVE', 'ENDED', 'PENDING']),
  bondCents: z.number().int().nullable().optional(),
});

export const zAttachment = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  mime: z.string(),
});

export const zTenantNote = z.object({
  id: z.string(),
  propertyId: z.string().nullable().optional(),
  tenantId: z.string(),
  tenancyId: z.string().nullable().optional(),
  createdByUserId: z.string(),
  createdAt: z.string(),
  body: z.string().min(1),
  tags: z.array(z.string()).default([]),
  attachments: z.array(zAttachment).optional(),
  pinned: z.boolean().optional(),
});

export const zTenantNoteCreate = zTenantNote
  .omit({ id: true, createdAt: true })
  .extend({ tenantId: z.string().min(1), createdByUserId: z.string().min(1) });

export const zTenantNoteUpdate = z
  .object({
    body: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    pinned: z.boolean().optional(),
    attachments: z.array(zAttachment).optional(),
  })
  .strict();

export const zCommLogEntry = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenancyId: z.string().nullable().optional(),
  type: z.enum(['CALL', 'EMAIL', 'SMS', 'IN_PERSON', 'OTHER']),
  direction: z.enum(['IN', 'OUT', 'N/A']),
  when: z.string(),
  subject: z.string().optional(),
  body: z.string().optional(),
  attachments: z.array(zAttachment).optional(),
  followUpTaskId: z.string().nullable().optional(),
});

export const zCommLogCreate = zCommLogEntry
  .omit({ id: true })
  .extend({ tenantId: z.string().min(1), when: z.string().min(1) });

export const zNotificationChannels = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
});

export const zNotificationQuietHours = z.object({
  start: z.string(),
  end: z.string(),
});

export const zNotificationPreference = z.object({
  id: z.string(),
  tenantId: z.string(),
  channels: zNotificationChannels,
  quietHours: zNotificationQuietHours.optional(),
});

export const zTenantDirectoryResponse = z.object({
  items: z.array(zTenant),
  pageInfo: z.object({
    page: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export const zTenantDetailResponse = z.object({
  tenant: zTenant,
  tenancies: z.array(zTenancy),
  latestArrears: z
    .object({
      days: z.number().int().nonnegative(),
      balanceCents: z.number().int(),
    })
    .nullable()
    .optional(),
  lastContact: zCommLogEntry.nullable().optional(),
});

export const zTenantNoteListResponse = z.object({
  items: z.array(zTenantNote),
  pageInfo: z.object({
    page: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export const zCommLogListResponse = z.object({
  items: z.array(zCommLogEntry),
  pageInfo: z.object({
    page: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export type Tenant = z.infer<typeof zTenant>;
export type TenantCreate = z.infer<typeof zTenantCreate>;
export type TenantUpdate = z.infer<typeof zTenantUpdate>;
export type Tenancy = z.infer<typeof zTenancy>;
export type TenantNote = z.infer<typeof zTenantNote>;
export type TenantNoteCreate = z.infer<typeof zTenantNoteCreate>;
export type CommLogEntry = z.infer<typeof zCommLogEntry>;
export type CommLogCreate = z.infer<typeof zCommLogCreate>;
export type NotificationPreference = z.infer<typeof zNotificationPreference>;
export type TenantDirectoryResponse = z.infer<typeof zTenantDirectoryResponse>;
export type TenantDetailResponse = z.infer<typeof zTenantDetailResponse>;
export type TenantNoteListResponse = z.infer<typeof zTenantNoteListResponse>;
export type CommLogListResponse = z.infer<typeof zCommLogListResponse>;
