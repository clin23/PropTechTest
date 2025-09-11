import { useState } from 'react';
import ExpenseForm from '../../../../components/ExpenseForm';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../../lib/categories';

export default function SearchExpensesPanel() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const items = EXPENSE_CATEGORY_OPTIONS.filter(c =>
    c.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div
      data-testid="search-expenses"
      className="p-4 border rounded-2xl shadow-sm space-y-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">Search Expenses</div>
        <button
          aria-label="Add custom expense"
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
        className="w-full border rounded p-1 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
      />
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {items.map(c => (
          <div
            key={c}
            draggable
            onDragStart={e =>
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ type: 'expenseTypes', value: c })
              )
            }
            className="p-1 text-sm bg-gray-100 dark:bg-gray-700 rounded cursor-grab text-gray-900 dark:text-gray-100"
          >
            {c}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">No results</div>
        )}
      </div>
      <ExpenseForm open={open} onOpenChange={setOpen} showTrigger={false} />
    </div>
  );
}
