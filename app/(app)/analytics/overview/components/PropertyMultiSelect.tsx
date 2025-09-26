'use client';

import { useMemo, useState } from 'react';

type PropertyOption = {
  id: string;
  address: string;
  imageUrl?: string;
};

type Props = {
  properties: PropertyOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function PropertyMultiSelect({ properties, selected, onChange }: Props) {
  const [search, setSearch] = useState('');
  const options = useMemo(() => {
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
    <div className="w-full space-y-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm" data-testid="property-filter">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Properties</h3>
        <button
          type="button"
          className="text-xs text-blue-600 hover:underline"
          onClick={() => onChange([])}
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
          className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="max-h-52 overflow-y-auto space-y-2" role="listbox" aria-label="Select properties">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
            isAllSelected
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
          }`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
            All
          </span>
          <span>All properties</span>
        </button>
        {options.map((property) => {
          const checked = selected.includes(property.id);
          return (
            <label
              key={property.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition cursor-pointer ${
                checked
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(property.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {property.address
                  .split(' ')
                  .slice(0, 2)
                  .map((segment) => segment.charAt(0))
                  .join('') || 'P'}
              </span>
              <span className="flex-1 text-gray-800 dark:text-gray-100">{property.address}</span>
            </label>
          );
        })}
        {options.length === 0 && (
          <p className="text-sm text-gray-500">No properties found</p>
        )}
      </div>
    </div>
  );
}

export default PropertyMultiSelect;
