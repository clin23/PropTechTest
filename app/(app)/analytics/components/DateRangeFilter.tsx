import type { AnalyticsStateType } from '../../../lib/schemas';

interface Props {
  state: AnalyticsStateType;
  onChange: (s: Partial<AnalyticsStateType>) => void;
}

export default function DateRangeFilter({ state }: Props) {
  return (
    <div data-testid="date-range-filter" className="p-4 border rounded-2xl shadow-sm">
      <div className="font-semibold mb-2">Date Range</div>
      <div className="text-sm">{state.from} → {state.to}</div>
    </div>
  );
}
