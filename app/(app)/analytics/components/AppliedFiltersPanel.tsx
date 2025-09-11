import type { AnalyticsStateType } from '../../../lib/schemas';

interface Props {
  state: AnalyticsStateType;
  onAdd: (key: keyof AnalyticsStateType['filters'], value: string) => void;
  onRemove: (key: keyof AnalyticsStateType['filters'], value: string) => void;
}

export default function AppliedFiltersPanel({ state, onAdd, onRemove }: Props) {
  const income = state.filters.incomeTypes || [];
  const expenses = state.filters.expenseTypes || [];

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
      className="p-4 border rounded-2xl shadow-sm space-y-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="font-semibold">Currently Applied</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <div className="font-medium mb-1">Income</div>
          <div className="flex flex-wrap gap-2">
            {income.map(value => (
              <span
                key={value}
                className="max-w-full break-words px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full inline-flex items-center gap-1 text-gray-900 dark:text-gray-100"
              >
                {value}
                <button
                  aria-label={`Remove ${value}`}
                  className="ml-1 text-xs"
                  onClick={() => onRemove('incomeTypes', value)}
                >
                  ×
                </button>
              </span>
            ))}
            {income.length === 0 && <div className="text-gray-500 dark:text-gray-400">None</div>}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-medium mb-1">Expenses</div>
          <div className="flex flex-wrap gap-2">
            {expenses.map(value => (
              <span
                key={value}
                className="max-w-full break-words px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full inline-flex items-center gap-1 text-gray-900 dark:text-gray-100"
              >
                {value}
                <button
                  aria-label={`Remove ${value}`}
                  className="ml-1 text-xs"
                  onClick={() => onRemove('expenseTypes', value)}
                >
                  ×
                </button>
              </span>
            ))}
            {expenses.length === 0 && <div className="text-gray-500 dark:text-gray-400">None</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
