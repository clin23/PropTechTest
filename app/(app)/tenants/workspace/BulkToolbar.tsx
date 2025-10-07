'use client';

import { useMemo } from 'react';

import { useWorkspaceDispatch, useWorkspaceState } from './state';

interface BulkToolbarProps {
  tenantCount: number;
}

export function BulkToolbar({ tenantCount }: BulkToolbarProps) {
  const selection = useWorkspaceState((state) => state.selection);
  const dispatch = useWorkspaceDispatch();
  const selectedCount = selection.length;
  const percentage = useMemo(() => {
    if (tenantCount === 0) return 0;
    return Math.round((selectedCount / tenantCount) * 100);
  }, [selectedCount, tenantCount]);

  if (selectedCount === 0) return null;

  const clear = () => dispatch({ type: 'clear-selection' });

  const triggerAction = (action: string) => {
    window.dispatchEvent(new CustomEvent('tenant-bulk-action', { detail: { action, selection } }));
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-surface/80 px-4 py-3 text-sm text-foreground" role="region" aria-live="polite">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold">{selectedCount} selected</span>
        <span className="text-xs text-muted-foreground">{percentage}% of view</span>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <ToolbarButton label="Email" onClick={() => triggerAction('email')} />
        <ToolbarButton label="SMS" onClick={() => triggerAction('sms')} />
        <ToolbarButton label="Task" onClick={() => triggerAction('task')} />
        <ToolbarButton label="Add tags" onClick={() => triggerAction('tag-add')} />
        <ToolbarButton label="Remove tags" onClick={() => triggerAction('tag-remove')} />
        <ToolbarButton label="Export" onClick={() => triggerAction('export')} />
        <ToolbarButton label="Start workflow" onClick={() => triggerAction('workflow')} />
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border/60 px-3 py-1.5 font-medium text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {label}
    </button>
  );
}

