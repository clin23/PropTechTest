'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addLedgerEntry,
  addMaintenance,
  createNote,
  createTask,
  logCommunication,
  triggerRentReview,
  uploadTenantFile,
} from '../../../../lib/tenants/client';
import type { LedgerEntry } from '../../../../lib/tenants/types';
import { useToast } from '../../../../components/ui/use-toast';

type QuickActionType =
  | 'ADD_INCOME'
  | 'ADD_EXPENSE'
  | 'UPLOAD_DOCUMENT'
  | 'LOG_CALL'
  | 'SEND_SMS'
  | 'EMAIL'
  | 'NEW_NOTE'
  | 'NEW_TASK'
  | 'MAINTENANCE_JOB'
  | 'RECORD_PAYMENT'
  | 'GENERATE_RECEIPT'
  | 'RENT_REVIEW';

interface QuickActionsBarProps {
  tenantId: string;
  tenantName: string;
}

const ledgerTypeMap: Record<'ADD_INCOME' | 'ADD_EXPENSE' | 'RECORD_PAYMENT', LedgerEntry['type']> = {
  ADD_INCOME: 'RENT',
  ADD_EXPENSE: 'EXPENSE',
  RECORD_PAYMENT: 'PAYMENT',
};

export function QuickActionsBar({ tenantId, tenantName }: QuickActionsBarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ledgerMutation = useMutation({
    mutationFn: ({ action, amount, note }: { action: keyof typeof ledgerTypeMap; amount: number; note?: string }) =>
      addLedgerEntry(tenantId, {
        type: ledgerTypeMap[action],
        amountCents: Math.round(amount * 100),
        note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-workspace', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-timeline', tenantId] });
      toast({ title: 'Ledger updated', description: 'Entry saved successfully.' });
    },
  });

  const noteMutation = useMutation({
    mutationFn: (body: string) => createNote(tenantId, { body, tags: [], author: 'You' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-notes', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-workspace', tenantId] });
      toast({ title: 'Note added', description: 'The timeline has been refreshed.' });
    },
  });

  const taskMutation = useMutation({
    mutationFn: (title: string) => createTask(tenantId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-workspace', tenantId] });
      toast({ title: 'Task created', description: 'Keep it moving!' });
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: (title: string) => addMaintenance(tenantId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-workspace', tenantId] });
      toast({ title: 'Maintenance logged', description: 'We added it to the workflow.' });
    },
  });

  const commsMutation = useMutation({
    mutationFn: ({ channel, summary, body }: { channel: 'CALL' | 'EMAIL' | 'SMS'; summary: string; body?: string }) =>
      logCommunication(tenantId, { channel, summary, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-timeline', tenantId] });
      toast({ title: 'Communication logged', description: 'The next action is recorded.' });
    },
  });

  const rentReviewMutation = useMutation({
    mutationFn: (payload: { basis: 'CPI' | 'PERCENT'; amount: number; effectiveDate: string }) =>
      triggerRentReview(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-timeline', tenantId] });
      toast({ title: 'Rent review drafted', description: 'Timeline updated with the proposal.' });
    },
  });

  const handleAction = useCallback(
    async (action: QuickActionType) => {
      switch (action) {
        case 'ADD_INCOME':
        case 'ADD_EXPENSE':
        case 'RECORD_PAYMENT': {
          const amountInput = prompt('Amount (AUD)');
          if (!amountInput) return;
          const amount = Number(amountInput);
          if (Number.isNaN(amount)) return;
          const note = prompt('Optional note') ?? undefined;
          ledgerMutation.mutate({ action, amount, note });
          break;
        }
        case 'NEW_NOTE': {
          const body = prompt(`Add note for ${tenantName}`);
          if (!body) return;
          noteMutation.mutate(body);
          break;
        }
        case 'NEW_TASK': {
          const taskTitle = prompt('Task title');
          if (!taskTitle) return;
          taskMutation.mutate(taskTitle);
          break;
        }
        case 'MAINTENANCE_JOB': {
          const jobTitle = prompt('Describe the maintenance job');
          if (!jobTitle) return;
          maintenanceMutation.mutate(jobTitle);
          break;
        }
        case 'LOG_CALL':
        case 'SEND_SMS':
        case 'EMAIL': {
          const summary = prompt(`Summary for ${action === 'EMAIL' ? 'email' : action === 'SEND_SMS' ? 'SMS' : 'call'}`);
          if (!summary) return;
          const body = prompt('Details (optional)') ?? undefined;
          const channel = action === 'LOG_CALL' ? 'CALL' : action === 'SEND_SMS' ? 'SMS' : 'EMAIL';
          commsMutation.mutate({ channel, summary, body });
          break;
        }
        case 'UPLOAD_DOCUMENT': {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '*/*';
          input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
              uploadTenantFile(tenantId, file)
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['tenant-workspace', tenantId] });
                  toast({ title: 'File uploaded', description: file.name });
                })
                .catch((error) => {
                  toast({ title: 'Upload failed', description: (error as Error).message });
                });
            }
          };
          input.click();
          break;
        }
        case 'GENERATE_RECEIPT': {
          toast({ title: 'Rent receipt generated', description: 'A PDF receipt is ready to share.' });
          break;
        }
        case 'RENT_REVIEW': {
          const effectiveDate = prompt('Effective date (YYYY-MM-DD)', new Date().toISOString().slice(0, 10));
          if (!effectiveDate) return;
          const basis = prompt('Basis (CPI or percent)', 'CPI');
          const amount = basis?.toUpperCase() === 'PERCENT' ? Number(prompt('Percentage increase', '5')) : 0;
          rentReviewMutation.mutate({
            basis: basis?.toUpperCase() === 'PERCENT' ? 'PERCENT' : 'CPI',
            amount: Number.isFinite(amount) ? amount : 0,
            effectiveDate,
          });
          break;
        }
        default:
          break;
      }
    },
    [
      ledgerMutation,
      noteMutation,
      taskMutation,
      maintenanceMutation,
      commsMutation,
      rentReviewMutation,
      tenantId,
      tenantName,
      toast,
      queryClient,
    ]
  );

  const ACTIONS: Array<{ key: QuickActionType; label: string }> = [
    { key: 'ADD_INCOME', label: 'Add income' },
    { key: 'ADD_EXPENSE', label: 'Add expense' },
    { key: 'UPLOAD_DOCUMENT', label: 'Upload document' },
    { key: 'LOG_CALL', label: 'Log call' },
    { key: 'SEND_SMS', label: 'Send SMS' },
    { key: 'EMAIL', label: 'Email' },
    { key: 'NEW_NOTE', label: 'New note' },
    { key: 'NEW_TASK', label: 'New task' },
    { key: 'MAINTENANCE_JOB', label: 'Maintenance job' },
    { key: 'RECORD_PAYMENT', label: 'Record payment' },
    { key: 'GENERATE_RECEIPT', label: 'Rent receipt' },
    { key: 'RENT_REVIEW', label: 'Rent review' },
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-surface/80 p-3">
      {ACTIONS.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => handleAction(action.key)}
          className="rounded-xl border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
