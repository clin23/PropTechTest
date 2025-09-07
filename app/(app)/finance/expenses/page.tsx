"use client";

import ExpenseForm from "../../../../components/ExpenseForm";
import ExpensesTable from "../../../../components/ExpensesTable";

export default function ExpensesPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Expenses</h1>
      <ExpenseForm />
      <ExpensesTable />
    </div>
  );
}

