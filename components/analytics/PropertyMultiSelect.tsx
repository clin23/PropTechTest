'use client';

import { useMemo, useState } from 'react';

export type PropertyOption = {
  id: string;
  address: string;
  imageUrl?: string;
};

type PropertyMultiSelectProps = {
  properties: PropertyOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export default function PropertyMultiSelect({ properties, selected, onChange }: PropertyMultiSelectProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const lower = search.toLowerCase();
    return properties.filter((property) => property.address.toLowerCase().includes(lower));
  }, [properties, search]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const isAllSelected = selected.length === 0;

  return (
    <div className="space-y-3" data-testid="property-filter">
      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span>Property selector</span>
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-full border border-transparent px-2 py-1 text-xs font-medium text-[#2F81F7] transition hover:bg-[#2F81F7]/10"
        >
          Clear
        </button>
      </div>
      <div>
        <label htmlFor="property-search" className="sr-only">
          Search properties
        </label>
        <input
          id="property-search"
          type="search"
          placeholder="Search properties"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-slate-200/70 bg-transparent px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2F81F7] dark:border-[#1F2937] dark:text-slate-200"
        />
      </div>
      <div className="max-h-52 space-y-2 overflow-y-auto" role="listbox" aria-label="Select properties">
        <button
          type="button"
          onClick={() => onChange([])}
          className={[
            'flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition',
            isAllSelected
              ? 'border-[#2F81F7] bg-[#2F81F7]/10 text-[#2F81F7]'
              : 'border-slate-200/70 text-slate-600 hover:border-[#2F81F7] hover:text-[#2F81F7] dark:border-[#1F2937] dark:text-slate-300',
          ].join(' ')}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F81F7]/10 text-xs font-semibold text-[#2F81F7]">
            All
          </span>
          <span className="font-medium">All properties</span>
        </button>
        {filtered.map((property) => {
          const checked = selected.includes(property.id);
          return (
            <label
              key={property.id}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition',
                checked
                  ? 'border-[#2F81F7] bg-[#2F81F7]/10 text-[#2F81F7]'
                  : 'border-slate-200/70 text-slate-600 hover:border-[#2F81F7] hover:text-[#2F81F7] dark:border-[#1F2937] dark:text-slate-300',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(property.id)}
                className="h-4 w-4 rounded border-slate-300 text-[#2F81F7] focus:ring-[#2F81F7]"
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {property.address
                  .split(' ')
                  .slice(0, 2)
                  .map((segment) => segment.charAt(0))
                  .join('') || 'P'}
              </span>
              <span className="flex-1 text-slate-700 dark:text-slate-200">{property.address}</span>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200/70 px-3 py-4 text-center text-sm text-slate-500 dark:border-[#1F2937] dark:text-slate-400">
            No properties found
          </p>
        )}
      </div>
    </div>
  );
}
