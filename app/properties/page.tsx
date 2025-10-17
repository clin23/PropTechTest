'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import PropertyOverviewCard from '../../components/PropertyOverviewCard';
import PropertiesGridSkeleton from '../../components/skeletons/PropertiesGridSkeleton';
import PropertyEditModal from '../../components/PropertyEditModal';
import { getProperty, listProperties } from '../../lib/api';
import type { PropertySummary } from '../../types/property';

export default function PropertiesPage() {
  const {
    data = [],
    isPending,
  } = useQuery<PropertySummary[]>({
    queryKey: ['properties'],
    queryFn: listProperties,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertySnapshot, setSelectedPropertySnapshot] = useState<PropertySummary | null>(null);

  const selectedPropertyFromList = useMemo(() => {
    if (!selectedPropertyId) return null;
    return data.find((property) => property.id === selectedPropertyId) ?? null;
  }, [data, selectedPropertyId]);

  const selectedPropertyDetailQuery = useQuery<PropertySummary>({
    queryKey: ['property', selectedPropertyId],
    queryFn: () => getProperty(selectedPropertyId!),
    enabled: !!selectedPropertyId,
  });

  const { data: selectedPropertyDetailData, isFetching: isFetchingSelectedProperty } =
    selectedPropertyDetailQuery;

  const modalProperty =
    selectedPropertyDetailData ?? selectedPropertyFromList ?? selectedPropertySnapshot;

  useEffect(() => {
    if (!selectedPropertyDetailData) return;
    setSelectedPropertySnapshot(selectedPropertyDetailData);
  }, [selectedPropertyDetailData]);

  useEffect(() => {
    if (!isEditMode) {
      setSelectedPropertyId(null);
      setSelectedPropertySnapshot(null);
    }
  }, [isEditMode]);

  const handleSelectProperty = (property: PropertySummary) => {
    if (!isEditMode) return;
    setSelectedPropertyId(property.id);
    setSelectedPropertySnapshot(property);
  };

  const closeEditModal = () => {
    setSelectedPropertyId(null);
    setSelectedPropertySnapshot(null);
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-white/90 backdrop-blur-sm dark:bg-gray-950/70">
          <PropertiesGridSkeleton />
        </div>
      )}
      <div className={`p-6 space-y-4 ${isPending ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Properties</h1>
            {isEditMode && (
              <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-300">
                Select a property below to edit its details.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add Property
            </Link>
            <button
              type="button"
              aria-pressed={isEditMode}
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 ${
                isEditMode
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                  : 'border-indigo-200 bg-white text-indigo-600 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-500/40 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-gray-800'
              }`}
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L9 17l-4 1 1-4 10.5-10.5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isEditMode ? 'Exit Edit Mode' : 'Edit Properties'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PropertyOverviewCard
              key={p.id}
              property={p}
              isEditMode={isEditMode}
              onSelect={isEditMode ? handleSelectProperty : undefined}
            />
          ))}
        </div>
      </div>
      {modalProperty && (
        <PropertyEditModal
          open={isEditMode && !!modalProperty}
          property={modalProperty}
          onClose={closeEditModal}
          isLoading={isFetchingSelectedProperty}
        />
      )}
    </div>
  );
}

