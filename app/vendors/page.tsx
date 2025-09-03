'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VendorCard from '../../components/VendorCard';
import { listVendors, createVendor, updateVendor } from '../../lib/api';

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: listVendors,
  });

  const create = useMutation({
    mutationFn: (payload: any) => createVendor(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateVendor(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      tags: (formData.get('tags') as string || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (editing) {
      update.mutate({ id: editing.id, data: payload });
    } else {
      create.mutate(payload);
    }
    setDrawerOpen(false);
    setEditing(null);
  };

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
        {vendors?.map((vendor: any) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onEdit={() => {
              setEditing(vendor);
              setDrawerOpen(true);
            }}
            onToggleFavourite={(fav) =>
              update.mutate({ id: vendor.id, data: { favourite: fav } })
            }
          />
        ))}
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md p-4 space-y-4"
          >
            <h2 className="text-lg font-semibold">
              {editing ? 'Edit Vendor' : 'New Vendor'}
            </h2>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                name="name"
                defaultValue={editing?.name || ''}
                className="border p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                defaultValue={editing?.tags?.join(', ') || ''}
                className="border p-2 w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-1"
                onClick={() => {
                  setDrawerOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
