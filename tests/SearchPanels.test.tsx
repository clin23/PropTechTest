import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchExpensesPanel from '../app/(app)/analytics/components/SearchExpensesPanel';
import SearchIncomePanel from '../app/(app)/analytics/components/SearchIncomePanel';

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

