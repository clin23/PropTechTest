import { useState } from 'react';

const CATEGORIES = ['Maintenance', 'Utilities', 'Insurance', 'Taxes'];

export default function SearchExpensesPanel() {
  const [q, setQ] = useState('');
  const items = CATEGORIES.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div data-testid="search-expenses" className="p-4 border rounded-2xl shadow-sm space-y-2">
      <div className="font-semibold">Search Expenses</div>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search categories"
        className="w-full border rounded p-1 text-sm"
      />
      <div className="space-y-1">
        {items.map(c => (
          <div
            key={c}
            draggable
            onDragStart={e => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'expenseTypes', value: c }))}
            className="p-1 text-sm bg-gray-100 rounded cursor-grab"
          >
            {c}
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">No results</div>}
      </div>
    </div>
  );
}
