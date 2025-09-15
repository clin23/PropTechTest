import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: ReactNode;
  hint?: string;
}

export default function MetricCard({ title, value, hint }: MetricCardProps) {
  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-gray-400">{hint}</div>}
    </div>
  );
}
