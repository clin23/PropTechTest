'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  fetchSavedFilters,
  saveFilterPreset,
  type TenantListParams,
} from '../../../../lib/tenants/client';
import type { TenantTag } from '../../../../lib/tenants/types';

const SEGMENTS: Array<{ tag: TenantTag; label: string }> = [
  { tag: 'A-GRADE', label: 'A-Grade' },
  { tag: 'WATCHLIST', label: 'Watchlist' },
  { tag: 'PROSPECT', label: 'Prospect' },
  { tag: 'ARREARS', label: 'Arrears' },
  { tag: 'INSPECTION_SOON', label: 'Inspection <30d' },
  { tag: 'VACATING', label: 'Vacating' },
  { tag: 'NEW', label: 'New' },
];

const USER_ID = 'demo-user';
const STORAGE_KEY = `tenant-crm:saved-filters:${USER_ID}`;

interface TenantSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  selectedTags: TenantTag[];
  onTagsChange: (tags: TenantTag[]) => void;
  arrearsOnly: boolean;
  onArrearsChange: (value: boolean) => void;
}

export function TenantSearchBar({
  value,
  onValueChange,
  selectedTags,
  onTagsChange,
  arrearsOnly,
  onArrearsChange,
}: TenantSearchBarProps) {
  const [savedFilters, setSavedFilters] = useState<Array<{ id: string; name: string; query: TenantListParams }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setSavedFilters(parsed);
        }
      } catch (error) {
        console.error('Failed to parse saved filters', error);
      }
    }
    fetchSavedFilters(USER_ID)
      .then((items) => {
        if (items.length) {
          setSavedFilters(items);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
  }, [savedFilters]);

  const isSegmentActive = useMemo(() => {
    const set = new Set(selectedTags);
    return (tag: TenantTag) => set.has(tag);
  }, [selectedTags]);

  const handleSegmentToggle = (tag: TenantTag) => {
    const set = new Set(selectedTags);
    if (set.has(tag)) {
      set.delete(tag);
    } else {
      set.add(tag);
    }
    onTagsChange(Array.from(set));
  };

  const handleSaveFilter = async () => {
    const name = prompt('Save filter as');
    if (!name) return;
    const filter = { id: `local-${Date.now()}`, name, query: { q: value, tags: selectedTags, arrearsOnly } };
    setSavedFilters((prev) => [...prev, filter]);
    setIsSaving(true);
    try {
      await saveFilterPreset(USER_ID, name, filter.query);
    } catch (error) {
      console.error('Failed to save filter', error);
    } finally {
      setIsSaving(false);
    }
  };

  const applyFilter = (filter: TenantListParams) => {
    onValueChange(filter.q ?? '');
    onTagsChange(filter.tags ?? []);
    onArrearsChange(Boolean(filter.arrearsOnly));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="Search tenants by name, email, phone or property…"
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={() => onValueChange('')}
              className="rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map((segment) => {
              const active = isSegmentActive(segment.tag);
              return (
                <button
                  type="button"
                  key={segment.tag}
                  onClick={() => handleSegmentToggle(segment.tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                  aria-pressed={active}
                >
                  {segment.label}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={arrearsOnly}
              onChange={(event) => onArrearsChange(event.target.checked)}
              className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary"
            />
            Show arrears only
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Saved filters</p>
            <p className="text-xs text-muted-foreground">Personal shortcuts stored per user</p>
          </div>
          <button
            type="button"
            onClick={handleSaveFilter}
            disabled={isSaving}
            className="rounded-xl border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save current'}
          </button>
        </div>
        {savedFilters.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No saved filters yet.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => applyFilter(filter.query)}
                className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {filter.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
