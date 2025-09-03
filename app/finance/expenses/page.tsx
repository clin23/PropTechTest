import ExpenseForm from '../../../components/ExpenseForm';
import ExpensesTable from '../../../components/ExpensesTable';

export default function ExpensesPage() {
  const rows = [
    { id: '1', date: '2024-01-01', category: 'Repairs', amount: 120 },
    { id: '2', date: '2024-02-05', category: 'Utilities', amount: 80 },
  ];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>
      <ExpenseForm />
      <div className="mt-4">
        <ExpensesTable rows={rows} />
      </div>
    </div>
  );
}
