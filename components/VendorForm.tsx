'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PhotoUpload from './PhotoUpload';
import {
  createVendor,
  updateVendor,
  type Vendor,
  uploadDocument,
} from '../lib/api';
import { useToast } from './ui/use-toast';

export default function VendorForm({
  vendor,
  onClose,
}: {
  vendor?: Vendor;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(vendor?.name ?? '');
  const [tags, setTags] = useState(vendor?.tags.join(', ') ?? '');
  const [insured, setInsured] = useState<boolean>(vendor?.insured ?? false);
  const [licensed, setLicensed] = useState<boolean>(vendor?.licensed ?? false);
  const [avgResponseTime, setAvgResponseTime] = useState<string>(
    vendor?.avgResponseTime?.toString() ?? ''
  );
  const [documents, setDocuments] = useState<string[]>(vendor?.documents ?? []);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: Vendor) =>
      vendor && vendor.id
        ? updateVendor(vendor.id, payload)
        : createVendor(payload),
    onSuccess: () => {
      toast({ title: vendor ? 'Vendor updated' : 'Vendor created' });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setError(null);
      onClose();
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : 'Failed to save vendor';
      setError(message);
      toast({ title: 'Failed to save vendor', description: message });
    },
  });

  const handleUpload = async (files: File[]) => {
    const uploaded: string[] = [];
    for (const file of files) {
      const res = await uploadDocument(file);
      uploaded.push(res.url);
    }
    setDocuments((d) => [...d, ...uploaded]);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        if (avgResponseTime && isNaN(parseFloat(avgResponseTime))) {
          setError('Average response time must be a number');
          return;
        }
        const payload: Vendor = {
          name,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          insured,
          licensed,
          avgResponseTime: avgResponseTime
            ? parseFloat(avgResponseTime)
            : undefined,
          documents,
        };
        mutation.mutate(payload);
      }}
      className="bg-white w-full max-w-md p-4 space-y-4"
    >
      <h2 className="text-lg font-semibold">
        {vendor ? 'Edit Vendor' : 'New Vendor'}
      </h2>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Tags (comma separated)</label>
        <input
          className="border p-2 w-full"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={insured}
            onChange={(e) => setInsured(e.target.checked)}
          />
          Insured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={licensed}
            onChange={(e) => setLicensed(e.target.checked)}
          />
          Licensed
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">Average response time (hours)</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={avgResponseTime}
          onChange={(e) => setAvgResponseTime(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Documents</label>
        <PhotoUpload onUpload={handleUpload} />
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {documents.map((doc) => (
              <span key={doc} className="text-xs bg-blue-100 p-1 rounded">
                {doc}
              </span>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-1" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {vendor ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
