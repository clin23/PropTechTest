'use client';

import { useRef, type ChangeEvent } from 'react';

import { useFiles, useUploadFile } from '../../lib/api/tenants';
import { useToast } from '../ui/use-toast';

interface FilesTabProps {
  tenantId: string;
}

export function FilesTab({ tenantId }: FilesTabProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const filesQuery = useFiles(tenantId);
  const uploadMutation = useUploadFile();
  const { toast } = useToast();

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = file.name.toLowerCase().includes('lease') ? 'Lease' : 'General';
    await uploadMutation.mutateAsync(
      { tenantId, file, type },
      {
        onSuccess: () => toast({ title: 'File uploaded' }),
        onError: () => toast({ title: 'Upload failed', variant: 'destructive' }),
      }
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tenant documents</h3>
          <p className="text-xs text-muted-foreground">Store leases, inspection reports, and handover files.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleUpload}
            className="text-xs text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filesQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-lg border border-border/50 bg-muted/30" />
            ))}
          </div>
        ) : !filesQuery.data?.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No files uploaded.</p>
            <p>Add leases, IDs, inspection reports, or photos.</p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Uploaded</th>
                <th className="px-3 py-2 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filesQuery.data.map((file) => (
                <tr key={file.id} className="border-b border-border/50">
                  <td className="px-3 py-2 text-foreground">{file.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{file.type}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(file.uploadedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-2">
                    {file.url ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-border/60 px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Preview unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

