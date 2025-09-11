import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpenseForm from '../components/ExpenseForm';

vi.mock('../lib/api', () => ({
  createExpense: vi.fn(),
  listProperties: vi.fn().mockResolvedValue([]),
}));

const renderForm = () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <ExpenseForm open showTrigger={false} />
    </QueryClientProvider>
  );
};

describe('ExpenseForm', () => {
  it('shows expense options after selecting a category', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'FinanceHolding' },
    });
    const expenseSelect = await screen.findByLabelText('Expense');
    fireEvent.change(expenseSelect, {
      target: { value: 'Mortgage interest' },
    });
    expect((expenseSelect as HTMLSelectElement).value).toBe('Mortgage interest');
  });
});
