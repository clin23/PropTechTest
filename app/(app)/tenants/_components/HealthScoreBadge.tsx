'use client';

interface HealthScoreBadgeProps {
  score: number;
}

export function HealthScoreBadge({ score }: HealthScoreBadgeProps) {
  const level = score >= 80 ? 'Strong' : score >= 60 ? 'Stable' : score >= 40 ? 'Watch' : 'Critical';
  const background =
    level === 'Strong'
      ? 'bg-emerald-500/20 text-emerald-500'
      : level === 'Stable'
        ? 'bg-blue-500/20 text-blue-500'
        : level === 'Watch'
          ? 'bg-amber-500/20 text-amber-500'
          : 'bg-destructive/10 text-destructive';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${background}`}
      title="Health score summarises on-time rate, comms responsiveness, and arrears days."
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {level} {score}
    </span>
  );
}
