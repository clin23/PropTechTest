import { useState } from 'react';
import IncomeForm from '../../../../components/IncomeForm';
import { INCOME_CATEGORY_OPTIONS } from '../../../../lib/categories';

export default function SearchIncomePanel() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const items = INCOME_CATEGORY_OPTIONS.filter(c =>
    c.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div
      data-testid="search-income"
      className="p-4 border rounded-2xl shadow-sm space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">Search Income</div>
        <button
          aria-label="Add custom income"
          onClick={() => setOpen(true)}
          className="text-xl leading-none text-blue-600"
        >
          +
        </button>
      </div>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search categories"
        className="w-full border rounded p-1 text-sm"
      />
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {items.map(c => (
          <div
            key={c}
            draggable
            onDragStart={e =>
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ type: 'incomeTypes', value: c })
              )
            }
            className="p-1 text-sm bg-gray-100 rounded cursor-grab"
          >
            {c}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-500">No results</div>
        )}
      </div>
      <IncomeForm open={open} onOpenChange={setOpen} showTrigger={false} />
    </div>
  );
}
