'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PhotoUpload from './PhotoUpload';
import {
  createVendor,
  updateVendor,
  type Vendor,
  uploadFile,
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
      const res = await uploadFile(file);
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
      className="w-full space-y-5 rounded-2xl bg-white p-6 text-slate-900 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-900 dark:text-slate-100 dark:ring-white/10"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {vendor ? 'Edit Vendor' : 'New Vendor'}
      </h2>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
        <input
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tags (comma separated)</label>
        <input
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={insured}
            onChange={(e) => setInsured(e.target.checked)}
          />
          Insured
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={licensed}
            onChange={(e) => setLicensed(e.target.checked)}
          />
          Licensed
        </label>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Average response time (hours)</label>
        <input
          type="number"
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={avgResponseTime}
          onChange={(e) => setAvgResponseTime(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Documents</label>
        <PhotoUpload onUpload={handleUpload} />
        {documents.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {documents.map((doc) => (
              <span
                key={doc}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
              >
                {doc}
              </span>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          {vendor ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
