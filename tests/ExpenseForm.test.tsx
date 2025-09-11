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

    it('disables the alternative field when one is filled', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText('Category'), {
        target: { value: 'FinanceHolding' },
      });
      const expenseSelect = await screen.findByLabelText('Expense');
      const customInput = screen.getByLabelText('Custom label');
      fireEvent.change(customInput, { target: { value: 'Other' } });
      expect(expenseSelect).toBeDisabled();
      fireEvent.change(customInput, { target: { value: '' } });
      expect(expenseSelect).toBeEnabled();
      fireEvent.change(expenseSelect, { target: { value: 'Mortgage interest' } });
      expect(customInput).toBeDisabled();
    });
  });
