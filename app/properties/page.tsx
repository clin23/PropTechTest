'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import PropertyOverviewCard from '../../components/PropertyOverviewCard';
import PropertiesGridSkeleton from '../../components/skeletons/PropertiesGridSkeleton';
import { listProperties } from '../../lib/api';
import type { PropertySummary } from '../../types/property';

export default function PropertiesPage() {
  const {
    data = [],
    isPending,
  } = useQuery<PropertySummary[]>({
    queryKey: ['properties'],
    queryFn: listProperties,
  });

  return (
    <div className="relative">
      {isPending && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-white/90 backdrop-blur-sm dark:bg-gray-950/70">
          <PropertiesGridSkeleton />
        </div>
      )}
      <div className={`p-6 space-y-4 ${isPending ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Properties</h1>
          <Link
            href="/properties/new"
            className="px-2 py-1 bg-blue-500 text-white"
          >
            Add Property
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PropertyOverviewCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

