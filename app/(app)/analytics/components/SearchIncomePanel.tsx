import { useState } from 'react';
import IncomeForm from '../../../../components/IncomeForm';
import { INCOME_CATEGORIES } from '../../../../lib/categories';

const humanize = (key: string) => key.replace(/([A-Z])/g, ' $1').trim();

export default function SearchIncomePanel() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const entries = Object.entries(INCOME_CATEGORIES)
    .map(([group, children]) => {
      const matchGroup = humanize(group).toLowerCase().includes(q.toLowerCase());
      const filteredChildren = children.filter(c =>
        c.toLowerCase().includes(q.toLowerCase())
      );
      return {
        group,
        children: q ? (matchGroup ? children : filteredChildren) : children,
        matchGroup,
      };
    })
    .filter(({ matchGroup, children }) => matchGroup || children.length > 0);

  const toggle = (group: string) =>
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));

  return (
    <div
      data-testid="search-income"
      className="p-4 border rounded-2xl shadow-sm space-y-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">Search Income</div>
        <button
          aria-label="Add custom income"
          onClick={() => setOpen(true)}
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
        className="w-full border rounded p-1 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-700"
      />
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {entries.map(({ group, children }) => {
          const isOpen = openGroups[group] || q !== '';
          return (
            <div key={group}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Toggle ${humanize(group)}`}
                  className="text-xs"
                  onClick={() => toggle(group)}
                >
                  {isOpen ? '-' : '+'}
                </button>
                <div
                  draggable
                  onDragStart={e =>
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({ type: 'categories', value: group })
                    )
                  }
                  className="flex-1 p-1 text-sm bg-gray-200 dark:bg-gray-700 rounded cursor-grab"
                >
                  {humanize(group)}
                </div>
              </div>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {children.map(c => (
                    <div
                      key={c}
                      draggable
                      onDragStart={e =>
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({ type: 'incomeTypes', value: c })
                        )
                      }
                      className="p-1 text-sm bg-gray-100 dark:bg-gray-600 rounded cursor-grab"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">No results</div>
        )}
      </div>
      <IncomeForm open={open} onOpenChange={setOpen} showTrigger={false} />
    </div>
  );
}

