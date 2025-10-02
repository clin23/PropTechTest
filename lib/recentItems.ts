"use client";

const MAX_RECENT_ITEMS = 4;

const STORAGE_KEYS = {
  property: "recentProperties",
  tenant: "recentTenants",
} as const;

export const RECENT_PROPERTY_STORAGE_KEY = STORAGE_KEYS.property;
export const RECENT_TENANT_STORAGE_KEY = STORAGE_KEYS.tenant;

type RecentItemType = keyof typeof STORAGE_KEYS;

export type { RecentItemType };

export interface RecentItemsEventDetail {
  type: RecentItemType;
  ids: string[];
}

export const RECENT_ITEMS_EVENT = "recent-items-updated";

function getStorageKey(type: RecentItemType) {
  return STORAGE_KEYS[type];
}

function readStoredIds(type: RecentItemType): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(getStorageKey(type));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === "string");
    }
  } catch (error) {
    console.warn("Failed to parse recent items from storage", error);
  }
  return [];
}

function writeStoredIds(type: RecentItemType, ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(getStorageKey(type), JSON.stringify(ids));
  const event: RecentItemsEventDetail = { type, ids };
  window.dispatchEvent(new CustomEvent(RECENT_ITEMS_EVENT, { detail: event }));
}

export function getRecentItemIds(type: RecentItemType): string[] {
  return readStoredIds(type);
}

export function recordRecentItem(type: RecentItemType, id: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const existing = readStoredIds(type);
  const next = [id, ...existing.filter((storedId) => storedId !== id)].slice(0, MAX_RECENT_ITEMS);
  writeStoredIds(type, next);
  return next;
}

export function clearRecentItems(type: RecentItemType) {
  if (typeof window === "undefined") {
    return;
  }
  writeStoredIds(type, []);
}

declare global {
  interface WindowEventMap {
    "recent-items-updated": CustomEvent<RecentItemsEventDetail>;
  }
}

export function getRecentPropertyIds() {
  return getRecentItemIds("property");
}

export function getRecentTenantIds() {
  return getRecentItemIds("tenant");
}

export function recordRecentProperty(id: string) {
  return recordRecentItem("property", id);
}

export function recordRecentTenant(id: string) {
  return recordRecentItem("tenant", id);
}
