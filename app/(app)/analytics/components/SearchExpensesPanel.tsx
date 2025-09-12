import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../../../../lib/categories';

interface Props {
  onAdd: (value: string) => void;
}

export default function SearchExpensesPanel({ onAdd }: Props) {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const qLower = q.toLowerCase();
  const entries = Object.entries(EXPENSE_CATEGORIES).filter(([group, items]) => {
    const label = group.replace(/([A-Z])/g, ' $1').trim();
    return (
      label.toLowerCase().includes(qLower) ||
      items.some(i => i.toLowerCase().includes(qLower))
    );
  });

  const handleAddAll = () => {
    Object.keys(EXPENSE_CATEGORIES).forEach(group => {
      const label = group.replace(/([A-Z])/g, ' $1').trim();
      onAdd(label);
    });
  };

  return (
    <div
      data-testid="search-expenses"
      className="p-4 border rounded-2xl shadow-sm space-y-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">Expenses</div>
        <button
          aria-label="Add all expenses"
          onClick={handleAddAll}
          className="text-xl leading-none text-blue-600 dark:text-blue-400"
        >
          +
        </button>
      </div>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search categories"
        className="w-full border rounded p-1 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
      />
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {entries.map(([group, items]) => {
          const label = group.replace(/([A-Z])/g, ' $1').trim();
          const showItems = expanded[group] || qLower.length > 0;
          const filteredItems = items.filter(i =>
            i.toLowerCase().includes(qLower)
          );
          return (
            <div key={group} className="space-y-1">
              <div
                className="p-1 text-sm bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between text-gray-900 dark:text-gray-100"
              >
                <span>{label}</span>
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`${expanded[group] ? 'Collapse' : 'Expand'} ${label}`}
                    onClick={() =>
                      setExpanded(prev => ({
                        ...prev,
                        [group]: !prev[group],
                      }))
                    }
                    className="text-xs"
                  >
                    {expanded[group] || qLower.length > 0 ? '▾' : '▸'}
                  </button>
                  <button
                    aria-label={`Add ${label}`}
                    onClick={() => onAdd(label)}
                    className="text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              {showItems &&
                filteredItems.map(item => (
                  <div
                    key={item}
                    className="ml-4 p-1 text-sm bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
                  >
                    {item}
                  </div>
                ))}
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">No results</div>
        )}
      </div>
    </div>
  );
}
