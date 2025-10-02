import { tenants } from '../store';
import { tenantDirectory, nextId } from '../tenant-crm/store';
import { zTenant } from '../../../lib/tenant-crm/schemas';

type NullableString = string | null | undefined;

const normalizeName = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
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

export function syncTenantForProperty(propertyId: string, tenantName: unknown) {
  const normalized = normalizeName(tenantName);
  if (!normalized) {
    unlinkTenantFromProperty(propertyId);
    return;
  }

  const timestamp = new Date().toISOString();

  let crmTenant = tenantDirectory.find((tenant) => tenant.currentPropertyId === propertyId);
  if (!crmTenant) {
    crmTenant = tenantDirectory.find(
      (tenant) => !tenant.currentPropertyId && tenant.fullName.trim().toLowerCase() === normalized.toLowerCase()
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
      id: nextId('tenant'),
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
