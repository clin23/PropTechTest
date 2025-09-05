'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { listListings } from '../../lib/api';
import type { Listing } from '../../types/listing';
import PageHeader from '../../components/PageHeader';
import Skeleton from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

export default function ListingsPage() {
  const { data: listings, isLoading, error } = useQuery<Listing[]>({ queryKey: ['listings'], queryFn: listListings });

  return (
    <div className="p-6">
      <PageHeader title="Listings">
        <Link href="/listings/new" className="px-2 py-1 bg-blue-500 text-white rounded">
          Add Listing
        </Link>
      </PageHeader>
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <ErrorState message={(error as Error).message} />
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Property</th>
              <th className="border px-2 py-1 text-left">Rent</th>
            </tr>
          </thead>
          <tbody>
            {listings?.map((l) => (
              <tr key={l.id}>
                <td className="border px-2 py-1">{l.property}</td>
                <td className="border px-2 py-1">${l.rent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
