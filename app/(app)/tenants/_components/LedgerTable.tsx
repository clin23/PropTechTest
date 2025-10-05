'use client';

import type { LedgerEntry } from '../../../../lib/tenants/types';

interface LedgerTableProps {
  entries: LedgerEntry[];
  tenantName: string;
}

export function LedgerTable({ entries, tenantName }: LedgerTableProps) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const balance = sorted.reduce((total, entry) => total + entry.amountCents, 0);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const rows = [['Date', 'Type', 'Amount', 'Note']];
      for (const entry of sorted) {
        rows.push([
          new Date(entry.date).toLocaleDateString(),
          entry.type,
          (entry.amountCents / 100).toFixed(2),
          entry.note ?? '',
        ]);
      }
      const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadFile(`${tenantName}-ledger.csv`, csv, 'text/csv');
    } else {
      const content = `Ledger summary for ${tenantName}\nBalance: ${formatCurrency(balance)}\nEntries: ${sorted.length}`;
      downloadFile(`${tenantName}-ledger.txt`, content, 'text/plain');
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ledger</h3>
          <p className="text-xs text-muted-foreground">
            Running balance {formatCurrency(balance)} across {sorted.length} entries.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="rounded-lg border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-background/80">
            {sorted.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-xs font-medium uppercase text-foreground">{entry.type}</td>
                <td className="px-4 py-2 text-right text-xs font-semibold text-foreground">{formatCurrency(entry.amountCents)}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{entry.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amountCents / 100);
}
