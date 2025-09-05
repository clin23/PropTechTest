'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProperty } from '../../../lib/api';
import PropertyDetailTabs from '../../../components/PropertyDetailTabs';
import type { PropertySummary } from '../../../types/property';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery<PropertySummary>({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Property Details</h1>
      {data && (
        <PropertyDetailTabs propertyId={data.id} events={data.events} />
      )}
    </div>
  );
}

