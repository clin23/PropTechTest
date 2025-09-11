import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchExpensesPanel from '../app/(app)/analytics/components/SearchExpensesPanel';
import SearchIncomePanel from '../app/(app)/analytics/components/SearchIncomePanel';

vi.mock('../components/ExpenseForm', () => ({ __esModule: true, default: () => null }));
vi.mock('../components/IncomeForm', () => ({ __esModule: true, default: () => null }));

describe('SearchExpensesPanel', () => {
  it('shows categories and allows expanding to items', () => {
    render(<SearchExpensesPanel />);
    const category = screen.getByText('Finance Holding');
    expect(category).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Toggle Finance Holding'));
    expect(screen.getByText('Mortgage interest')).toBeInTheDocument();
    expect(category).toHaveAttribute('draggable', 'true');
    expect(screen.getByText('Mortgage interest')).toHaveAttribute('draggable', 'true');
  });
});

describe('SearchIncomePanel', () => {
  it('shows categories and allows expanding to items', () => {
    render(<SearchIncomePanel />);
    const category = screen.getByText('Core Rent');
    expect(category).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Toggle Core Rent'));
    expect(screen.getByText('Base rent')).toBeInTheDocument();
    expect(category).toHaveAttribute('draggable', 'true');
    expect(screen.getByText('Base rent')).toHaveAttribute('draggable', 'true');
  });
});

