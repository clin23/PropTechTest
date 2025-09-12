import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchExpensesPanel from '../app/(app)/analytics/components/SearchExpensesPanel';
import SearchIncomePanel from '../app/(app)/analytics/components/SearchIncomePanel';
import AppliedFiltersPanel from '../app/(app)/analytics/components/AppliedFiltersPanel';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../lib/categories';
import type { AnalyticsStateType } from '../lib/schemas';

describe('SearchExpensesPanel', () => {
  it('shows categories, expands, and adds items', () => {
    const onAdd = vi.fn();
    render(<SearchExpensesPanel onAdd={onAdd} />);
    const category = screen.getByText('Finance Holding');
    expect(category).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Expand Finance Holding'));
    expect(screen.getByText('Mortgage interest')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Add Mortgage interest'));
    expect(onAdd).toHaveBeenCalledWith('Mortgage interest');
  });
});

describe('SearchIncomePanel', () => {
  it('shows categories, expands, and adds items', () => {
    const onAdd = vi.fn();
    render(<SearchIncomePanel onAdd={onAdd} />);
    const category = screen.getByText('Core Rent');
    expect(category).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Expand Core Rent'));
    expect(screen.getByText('Base rent')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Add Base rent'));
    expect(onAdd).toHaveBeenCalledWith('Base rent');
  });
});

describe('AppliedFiltersPanel', () => {
  it('collapses all income and expenses into single tags', () => {
    const onRemove = vi.fn();
    const allIncome = Object.keys(INCOME_CATEGORIES).map(g =>
      g.replace(/([A-Z])/g, ' $1').trim()
    );
    const allExpenses = Object.keys(EXPENSE_CATEGORIES).map(g =>
      g.replace(/([A-Z])/g, ' $1').trim()
    );
    const state: AnalyticsStateType = {
      viz: 'line',
      metric: 'net',
      groupBy: 'time',
      granularity: 'month',
      from: '',
      to: '',
      filters: {
        properties: [],
        categories: [],
        incomeTypes: allIncome,
        expenseTypes: allExpenses,
        tenants: [],
        tags: [],
      },
    };
    render(
      <AppliedFiltersPanel state={state} onAdd={() => {}} onRemove={onRemove} />
    );
    expect(screen.getByText('All Income')).toBeInTheDocument();
    expect(screen.getByText('All Expenses')).toBeInTheDocument();
    expect(screen.queryByText('Core Rent')).not.toBeInTheDocument();
    expect(screen.queryByText('Finance Holding')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Remove All Income'));
    expect(onRemove).toHaveBeenCalledTimes(allIncome.length);
    fireEvent.click(screen.getByLabelText('Remove All Expenses'));
    expect(onRemove).toHaveBeenCalledTimes(
      allIncome.length + allExpenses.length
    );
  });
});

