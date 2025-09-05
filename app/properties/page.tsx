'use client';

import { useQuery } from '@tanstack/react-query';
import PropertyOverviewCard from '../../components/PropertyOverviewCard';
import { listProperties } from '../../lib/api';
import type { PropertySummary } from '../../types/property';

export default function PropertiesPage() {
  const { data = [] } = useQuery<PropertySummary[]>({
    queryKey: ['properties'],
    queryFn: listProperties,
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Properties</h1>
      {data.map((p) => (
        <PropertyOverviewCard key={p.id} property={p} />
      ))}
    </div>
  );
}

