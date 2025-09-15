import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: ReactNode;
  hint?: string;
}

export default function MetricCard({ title, value, hint }: MetricCardProps) {
  return (
    <div className="p-4 rounded-2xl card">
      <div className="text-sm text-text-secondary">{title}</div>
      <div className="mt-2 text-2xl font-bold text-text-primary">{value}</div>
      {hint && <div className="text-xs text-text-muted">{hint}</div>}
    </div>
  );
}
