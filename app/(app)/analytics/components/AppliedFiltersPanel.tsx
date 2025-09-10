import type { AnalyticsStateType } from '../../../lib/schemas';

interface Props {
  state: AnalyticsStateType;
  onRemove: (key: string, value: string) => void;
}

export default function AppliedFiltersPanel({ state }: Props) {
  const chips: string[] = [];
  Object.entries(state.filters).forEach(([k, arr]) => {
    (arr as string[]).forEach(v => chips.push(`${k}:${v}`));
  });
  return (
    <div data-testid="applied-filters" className="p-4 border rounded-2xl shadow-sm space-y-2">
      <div className="font-semibold">Currently Applied</div>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="px-2 py-1 text-sm bg-gray-200 rounded-full">
            {c}
          </span>
        ))}
        {chips.length === 0 && <div className="text-sm text-gray-500">None</div>}
      </div>
    </div>
  );
}
