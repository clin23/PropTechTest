import type { AnalyticsStateType } from '../../../lib/schemas';

interface Props {
  state: AnalyticsStateType;
  onAdd: (key: keyof AnalyticsStateType['filters'], value: string) => void;
  onRemove: (key: keyof AnalyticsStateType['filters'], value: string) => void;
}

export default function AppliedFiltersPanel({ state, onAdd, onRemove }: Props) {
  const chips: { key: keyof AnalyticsStateType['filters']; value: string }[] = [];
  (Object.entries(state.filters) as [keyof AnalyticsStateType['filters'], string[]][]).forEach(([k, arr]) => {
    (arr || []).forEach(v => chips.push({ key: k, value: v }));
  });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.type && data.value) {
        onAdd(data.type, data.value);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      data-testid="applied-filters"
      className="p-4 border rounded-2xl shadow-sm space-y-2"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="font-semibold">Currently Applied</div>
      <div className="flex flex-wrap gap-2">
        {chips.map(({ key, value }) => (
          <span
            key={key + value}
            className="px-2 py-1 text-sm bg-gray-200 rounded-full flex items-center gap-1"
          >
            {key}:{value}
            <button
              aria-label={`Remove ${value}`}
              className="ml-1 text-xs"
              onClick={() => onRemove(key, value)}
            >
              ×
            </button>
          </span>
        ))}
        {chips.length === 0 && <div className="text-sm text-gray-500">None</div>}
      </div>
    </div>
  );
}
