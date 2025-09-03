import ExpenseForm from '../../../components/ExpenseForm';
import ExpensesTable from '../../../components/ExpensesTable';

export default function ExpensesPage() {
  // TODO: replace hard-coded property ID with route param when available
  const propertyId = "1";
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>
      <ExpenseForm propertyId={propertyId} />
      <div className="mt-4">
        <ExpensesTable propertyId={propertyId} />
      </div>
    </div>
  );
}
