'use client';

import { useState } from 'react';
import type { DragEvent } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { INCOME_CATEGORIES } from '../../../../lib/categories';

interface Props {
  onAdd: (value: string) => void;
}

export default function SearchIncomePanel({ onAdd }: Props) {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // track user defined order of income groups
  const [order, setOrder] = useState<string[]>(
    Object.keys(INCOME_CATEGORIES)
  );

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    value: string
  ) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'incomeTypes', value })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    setOrder(prev => {
      const newOrder = Array.from(prev);
      const [removed] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, removed);
      return newOrder;
    });
  };

  const qLower = q.toLowerCase();
  const entries = order.filter(group => {
    const items = INCOME_CATEGORIES[group as keyof typeof INCOME_CATEGORIES];
    const label = group.replace(/([A-Z])/g, ' $1').trim();
    return (
      label.toLowerCase().includes(qLower) ||
      items.some(i => i.toLowerCase().includes(qLower))
    );
  });

  const handleAddAll = () => {
    Object.keys(INCOME_CATEGORIES).forEach(group => {
      const label = group.replace(/([A-Z])/g, ' $1').trim();
      onAdd(label);
    });
  };

  return (
    <div
      data-testid="search-income"
      className="p-4 border rounded-2xl shadow-sm space-y-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">Income</div>
        <button
          aria-label="Add all income"
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="income-groups">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-1 max-h-40 overflow-y-auto"
            >
              {entries.map((group, index) => {
                const items =
                  INCOME_CATEGORIES[group as keyof typeof INCOME_CATEGORIES];
                const label = group.replace(/([A-Z])/g, ' $1').trim();
                const showItems = expanded[group] || qLower.length > 0;
                const filteredItems = items.filter(i =>
                  i.toLowerCase().includes(qLower)
                );
                return (
                  <Draggable draggableId={group} index={index} key={group}>
                    {providedItem => (
                      <div
                        ref={providedItem.innerRef}
                        {...providedItem.draggableProps}
                        {...providedItem.dragHandleProps}
                        onDragStart={e => handleDragStart(e, label)}
                        className="space-y-1"
                      >
                        <div className="p-1 text-sm bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between text-gray-900 dark:text-gray-100">
                          <span>{label}</span>
                          <div className="flex items-center gap-1">
                            <button
                              aria-label={`${
                                expanded[group] ? 'Collapse' : 'Expand'
                              } ${label}`}
                              onClick={() =>
                                setExpanded(prev => ({
                                  ...prev,
                                  [group]: !prev[group],
                                }))
                              }
                              className="text-xs"
                            >
                              {expanded[group] || qLower.length > 0
                                ? '▾'
                                : '▸'}
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
                              draggable
                              onDragStart={e => handleDragStart(e, item)}
                              className="ml-4 p-1 text-sm bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between text-gray-900 dark:text-gray-100"
                            >
                              <span>{item}</span>
                              <button
                                aria-label={`Add ${item}`}
                                onClick={() => onAdd(item)}
                                className="text-xs"
                              >
                                +
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              {entries.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No results
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
