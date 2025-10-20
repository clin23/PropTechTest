'use client';

import { useEffect, useMemo, useState } from 'react';

import type { WorkspaceFilters } from './state';
import { useWorkspaceDispatch, useWorkspaceState } from './state';

type SavedView = {
  id: string;
  name: string;
  filters: WorkspaceFilters;
  pinned?: boolean;
  updatedAt: number;
};

const SAVED_VIEWS_KEY = 'tenant-workspace:saved-views';
const STAGES = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ENDING', label: 'Ending' },
  { value: 'VACATING', label: 'Vacating' },
] as const;

const ARREARS = [
  { value: 'LOW', label: 'Low (7+)' },
  { value: 'MEDIUM', label: 'Medium (14+)' },
  { value: 'HIGH', label: 'High (21+)' },
  { value: 'CRITICAL', label: 'Critical (28+)' },
] as const;

const LAST_CONTACT_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Any time', value: null },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const INSPECTION_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Any window', value: null },
  { label: 'Next 14 days', value: 14 },
  { label: 'Next 30 days', value: 30 },
  { label: 'Next 60 days', value: 60 },
];

export function FiltersPanel() {
  const filters = useWorkspaceState((state) => state.filters);
  const recentSearches = useWorkspaceState((state) => state.recentSearches);
  const savedViewId = useWorkspaceState((state) => state.savedViewId);
  const dispatch = useWorkspaceDispatch();
  const [search, setSearch] = useState(filters.search);
  const [views, setViews] = useState<SavedView[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  useEffect(() => {
    setSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SAVED_VIEWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedView[];
        if (Array.isArray(parsed)) {
          setViews(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load saved views', error);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'set-filter', key: 'search', value: search });
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [dispatch, search]);

  const persistViews = (next: SavedView[]) => {
    setViews(next);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next));
  };

  const handleSaveView = () => {
    const name = window.prompt('Save current view as');
    if (!name) return;
    const view: SavedView = {
      id: `view-${Date.now()}`,
      name,
      filters,
      updatedAt: Date.now(),
    };
    const next = [...views.filter((item) => item.name !== name), view];
    persistViews(next);
    dispatch({ type: 'set-saved-view', savedViewId: view.id });
  };

  const handleApplyView = (view: SavedView) => {
    dispatch({ type: 'set-filters', value: view.filters, savedViewId: view.id });
  };

  const handleDeleteView = (viewId: string) => {
    const next = views.filter((item) => item.id !== viewId);
    persistViews(next);
    if (savedViewId === viewId) {
      dispatch({ type: 'set-saved-view', savedViewId: undefined });
    }
  };

  const handleTogglePin = (viewId: string) => {
    const next = views.map((view) =>
      view.id === viewId ? { ...view, pinned: !view.pinned, updatedAt: Date.now() } : view
    );
    persistViews(next);
  };

  const handleSearchSubmit = (value: string) => {
    dispatch({ type: 'record-search', value });
  };

  const clearFilters = () => {
    dispatch({ type: 'set-filters', value: { ...filters, ...defaultResetFilters(), search: '' } });
    setSearch('');
  };

  const stageSet = useMemo(() => new Set(filters.stages), [filters.stages]);
  const arrearsSet = useMemo(() => new Set(filters.arrearsTiers), [filters.arrearsTiers]);

  return (
    <div className="flex flex-col gap-6 text-sm">
      <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-sm">
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Search</label>
        <div className="mt-2 space-y-2">
          <input
            id="tenant-search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearchSubmit(event.currentTarget.value);
              }
            }}
            placeholder="Search by name, email, phone, address, tags"
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Search tenants"
          />
          {recentSearches.length ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Recent searches</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(item);
                        handleSearchSubmit(item);
                      }}
                      className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Segments</h3>
              <p className="text-xs text-muted-foreground">Combine stages, health and arrears</p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Clear all
            </button>
          </header>
          <div className="mt-3 space-y-4">
            <fieldset>
              <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {STAGES.map((stage) => {
                  const active = stageSet.has(stage.value);
                  return (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => dispatch({ type: 'toggle-stage', stage: stage.value })}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-primary/40'
                      }`}
                      aria-pressed={active}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Health score</legend>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min {filters.healthRange[0]}</span>
                  <span>Max {filters.healthRange[1]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.healthRange[0]}
                    onChange={(event) =>
                      dispatch({
                        type: 'set-filter',
                        key: 'healthRange',
                        value: [Number(event.target.value), filters.healthRange[1]] as [number, number],
                      })
                    }
                    className="w-full"
                    aria-label="Minimum health score"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.healthRange[1]}
                    onChange={(event) =>
                      dispatch({
                        type: 'set-filter',
                        key: 'healthRange',
                        value: [filters.healthRange[0], Number(event.target.value)] as [number, number],
                      })
                    }
                    className="w-full"
                    aria-label="Maximum health score"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arrears tiers</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ARREARS.map((tier) => {
                  const active = arrearsSet.has(tier.value);
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => {
                        const set = new Set(filters.arrearsTiers);
                        if (set.has(tier.value)) {
                          set.delete(tier.value);
                        } else {
                          set.add(tier.value);
                        }
                        dispatch({ type: 'set-filter', key: 'arrearsTiers', value: Array.from(set) });
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active
                          ? 'border-destructive text-destructive'
                          : 'border-border/60 text-muted-foreground hover:border-destructive/60'
                      }`}
                      aria-pressed={active}
                    >
                      {tier.label}
                    </button>
                  );
                })}
                <label className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={filters.showArrearsOnly}
                    onChange={(event) => dispatch({ type: 'set-filter', key: 'showArrearsOnly', value: event.target.checked })}
                    className="h-4 w-4 rounded border-border/60 text-destructive focus:ring-destructive"
                  />
                  Show arrears only
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last contact</label>
            <select
              value={filters.lastContactWithinDays ?? ''}
              onChange={(event) =>
                dispatch({
                  type: 'set-filter',
                  key: 'lastContactWithinDays',
                  value: event.target.value === '' ? null : Number(event.target.value),
                })
              }
              className="mt-2 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {LAST_CONTACT_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inspection window</label>
            <select
              value={filters.inspectionWindowDays ?? ''}
              onChange={(event) =>
                dispatch({
                  type: 'set-filter',
                  key: 'inspectionWindowDays',
                  value: event.target.value === '' ? null : Number(event.target.value),
                })
              }
              className="mt-2 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {INSPECTION_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={filters.watchlistOnly}
              onChange={(event) => dispatch({ type: 'set-filter', key: 'watchlistOnly', value: event.target.checked })}
              className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary"
            />
            Watchlist only
          </label>
        </div>

        <section className="space-y-3">
          <header>
            <h3 className="text-sm font-semibold text-foreground">Tags</h3>
            <p className="text-xs text-muted-foreground">Multi-select to refine results</p>
          </header>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {tag.replace('_', ' ')}
              </span>
            ))}
            <TagPicker
              value={filters.tags}
              onChange={(value) => dispatch({ type: 'set-filter', key: 'tags', value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom tags</label>
            <div className="flex items-center gap-2">
              <input
                value={customTagInput}
                onChange={(event) => setCustomTagInput(event.target.value)}
                placeholder="Add tag and press Enter"
                className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    const value = customTagInput.trim();
                    if (!value) return;
                    if (!filters.customTags.includes(value)) {
                      dispatch({
                        type: 'set-filter',
                        key: 'customTags',
                        value: [...filters.customTags, value],
                      });
                    }
                    setCustomTagInput('');
                  }
                }}
              />
              {filters.customTags.length ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'set-filter', key: 'customTags', value: [] })}
                  className="rounded-lg border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.customTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'set-filter',
                      key: 'customTags',
                      value: filters.customTags.filter((value) => value !== tag),
                    })
                  }
                  className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      </section>

      <section className="rounded-2xl border border-border/60 bg-surface/70 p-4 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Saved views</h3>
            <p className="text-xs text-muted-foreground">Capture filter presets and pin favourites</p>
          </div>
          <button
            type="button"
            onClick={handleSaveView}
            className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Save current
          </button>
        </header>
        {views.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No saved views yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {views
              .slice()
              .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
              .map((view) => (
                <li
                  key={view.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                    savedViewId === view.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 bg-background'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleApplyView(view)}
                    className="flex-1 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {view.name}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(view.id)}
                      aria-label={view.pinned ? 'Unpin view' : 'Pin view'}
                      className={`rounded-full border px-2 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        view.pinned ? 'border-primary text-primary' : 'border-border/60 text-muted-foreground'
                      }`}
                    >
                      {view.pinned ? 'Pinned' : 'Pin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteView(view.id)}
                      className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:border-destructive/60 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/60"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const ALL_TAGS = ['A-GRADE', 'WATCHLIST', 'PROSPECT', 'ARREARS', 'INSPECTION_SOON', 'VACATING', 'NEW'] as const;

function TagPicker({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const available = ALL_TAGS.filter((tag) => !value.includes(tag));
  if (available.length === 0) return null;
  return (
    <select
      value=""
      onChange={(event) => {
        const tag = event.target.value;
        if (!tag) return;
        onChange([...value, tag]);
      }}
      className="rounded-full border border-dashed border-border/60 bg-transparent px-3 py-1 text-xs text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/60"
      aria-label="Add tag filter"
    >
      <option value="">+ Tag</option>
      {available.map((tag) => (
        <option key={tag} value={tag}>
          {tag.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}

function defaultResetFilters(): Partial<WorkspaceFilters> {
  return {
    stages: [],
    healthRange: [0, 100],
    arrearsTiers: [],
    lastContactWithinDays: null,
    inspectionWindowDays: null,
    watchlistOnly: false,
    tags: [],
    customTags: [],
    showArrearsOnly: false,
  } satisfies Partial<WorkspaceFilters>;
}

