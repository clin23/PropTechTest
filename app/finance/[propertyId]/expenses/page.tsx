import ExpenseForm from '../../../../components/ExpenseForm';
import ExpensesTable from '../../../../components/ExpensesTable';

export default function ExpensesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>
      <ExpenseForm />
      <div className="mt-4">
        <ExpensesTable />
      </div>
    </div>
  );
}
