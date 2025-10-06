'use client';

import { useCallback, useState } from 'react';

import { uploadTenantFile } from '../../../../lib/tenants/client';
import { useToast } from '../../../../components/ui/use-toast';

interface UploadDropzoneProps {
  tenantId: string;
}

export function UploadDropzone({ tenantId }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      for (const file of Array.from(files)) {
        try {
          await uploadTenantFile(tenantId, file);
          toast({ title: 'Uploaded file', description: file.name });
        } catch (error) {
          toast({ title: 'Upload failed', description: (error as Error).message });
        }
      }
    },
    [tenantId, toast]
  );

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer?.files ?? null);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center text-sm transition ${
        isDragging ? 'border-primary bg-primary/5 text-primary' : 'border-border/60 bg-surface/60 text-muted-foreground'
      }`}
    >
      <span className="text-sm font-medium text-foreground">Drop documents here</span>
      <span className="mt-2 text-xs text-muted-foreground">
        PDFs, images, receipts. They’ll be OCR-processed for quick search.
      </span>
      <input
        type="file"
        className="sr-only"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}
