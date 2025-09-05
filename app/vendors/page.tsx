'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VendorCard from '../../components/VendorCard';
import VendorForm from '../../components/VendorForm';
import { listVendors, updateVendor, type Vendor } from '../../lib/api';

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: listVendors,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
      updateVendor(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Vendors</h1>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          New Vendor
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {vendors?.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onEdit={() => {
              setEditing(vendor);
              setDrawerOpen(true);
            }}
            onToggleFavourite={(fav) =>
              update.mutate({ id: vendor.id!, data: { favourite: fav } })
            }
          />
        ))}
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end">
          <VendorForm
            vendor={editing || undefined}
            onClose={() => {
              setDrawerOpen(false);
              setEditing(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
