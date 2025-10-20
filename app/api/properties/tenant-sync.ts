import { properties, tenants } from '../store';
import { tenantDirectory, nextId } from '../tenant-crm/store';
import { zTenant } from '../../../lib/tenant-crm/schemas';

type NullableString = string | null | undefined;

const normalizeName = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

type SyncTenantTarget =
  | string
  | null
  | undefined
  | {
      id?: unknown;
      fullName?: unknown;
      name?: unknown;
    };

const resolveTenantId = (value: SyncTenantTarget): string | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  if ('id' in value && typeof value.id === 'string') {
    return value.id;
  }
  return undefined;
};

const resolveTenantName = (value: SyncTenantTarget): unknown => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;
  if ('fullName' in value) {
    return (value as { fullName?: unknown }).fullName;
  }
  if ('name' in value) {
    return (value as { name?: unknown }).name;
  }
  return undefined;
};

const ensureTag = (tags: NullableString[] | undefined, tag: string, present: boolean) => {
  const existing = Array.isArray(tags) ? tags.filter((value): value is string => typeof value === 'string') : [];
  const normalized = new Set(existing.map((value) => value.trim()).filter(Boolean));
  const normalizedTag = tag.trim();
  if (!normalizedTag) return Array.from(normalized);
  if (present) {
    normalized.add(normalizedTag);
  } else {
    normalized.delete(normalizedTag);
  }
  return Array.from(normalized);
};

export function unlinkTenantFromProperty(propertyId: string) {
  const timestamp = new Date().toISOString();
  const property = properties.find((item) => item.id === propertyId);
  if (property) {
    property.tenant = '';
  }
  const crmTenant = tenantDirectory.find((tenant) => tenant.currentPropertyId === propertyId);
  if (crmTenant) {
    crmTenant.currentPropertyId = null;
    crmTenant.currentTenancyId = null;
    crmTenant.updatedAt = timestamp;
    crmTenant.tags = ensureTag(crmTenant.tags, 'A-grade', false);
    crmTenant.tags = ensureTag(crmTenant.tags, 'prospect', true);
  }
  const linkIndex = tenants.findIndex((link) => link.propertyId === propertyId);
  if (linkIndex !== -1) {
    tenants.splice(linkIndex, 1);
  }
}

export function syncTenantForProperty(propertyId: string, tenant: SyncTenantTarget) {
  const tenantId = resolveTenantId(tenant);
  const normalized = normalizeName(resolveTenantName(tenant));
  if (!normalized) {
    unlinkTenantFromProperty(propertyId);
    return;
  }

  const existingLinkedTenant = tenantDirectory.find(
    (item) => item.currentPropertyId === propertyId
  );
  if (existingLinkedTenant && tenantId && existingLinkedTenant.id !== tenantId) {
    unlinkTenantFromProperty(propertyId);
  }

  const timestamp = new Date().toISOString();

  const property = properties.find((item) => item.id === propertyId);
  if (property) {
    property.tenant = normalized;
  }

  let crmTenant = tenantId
    ? tenantDirectory.find((item) => item.id === tenantId)
    : undefined;
  if (!crmTenant) {
    crmTenant = tenantDirectory.find((item) => item.currentPropertyId === propertyId);
  }
  if (!crmTenant) {
    crmTenant = tenantDirectory.find(
      (item) =>
        !item.currentPropertyId && item.fullName.trim().toLowerCase() === normalized.toLowerCase()
    );
  }

  if (crmTenant) {
    crmTenant.fullName = normalized;
    crmTenant.currentPropertyId = propertyId;
    crmTenant.updatedAt = timestamp;
    crmTenant.tags = ensureTag(crmTenant.tags, 'prospect', false);
    crmTenant.tags = ensureTag(crmTenant.tags, 'A-grade', true);
  } else {
    const created = zTenant.parse({
      id: tenantId ?? nextId('tenant'),
      fullName: normalized,
      email: undefined,
      phone: undefined,
      altContacts: [],
      tags: ['A-grade'],
      currentPropertyId: propertyId,
      currentTenancyId: null,
      riskFlags: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    tenantDirectory.push(created);
    crmTenant = created;
  }

  const linkIndex = tenants.findIndex((link) => link.propertyId === propertyId);
  const link = { id: crmTenant.id, name: normalized, propertyId };
  if (linkIndex === -1) {
    tenants.push(link);
  } else {
    tenants[linkIndex] = link;
  }
}
