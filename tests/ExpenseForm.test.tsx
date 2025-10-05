import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpenseForm from '../components/ExpenseForm';
import { ToastProvider } from '../components/ui/use-toast';

vi.mock('../lib/api', () => ({
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  listProperties: vi.fn().mockResolvedValue([]),
}));

const renderForm = () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <ExpenseForm open showTrigger={false} />
      </ToastProvider>
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

    it('hides the alternative field when one is filled', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText('Category'), {
        target: { value: 'FinanceHolding' },
      });
      expect(screen.getByLabelText('Expense')).toBeInTheDocument();
      const customInput = screen.getByLabelText('Custom label');
      expect(customInput).toBeInTheDocument();

      fireEvent.change(customInput, {
        target: { value: 'Other' },
      });
      expect(screen.queryByLabelText('Expense')).toBeNull();

      fireEvent.change(customInput, {
        target: { value: '' },
      });
      expect(screen.getByLabelText('Expense')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Expense'), {
        target: { value: 'Mortgage interest' },
      });
      expect(screen.queryByLabelText('Custom label')).toBeNull();
    });
  });
