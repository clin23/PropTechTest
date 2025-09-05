"use client";
import { useEffect, useState } from "react";

interface Property { monthlyRent?: number }
interface Expense { amount?: number }

export default function CashflowTile() {
  const [rent, setRent] = useState(0);
  const [expenses, setExpenses] = useState(0);

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then((data: Property[]) => {
        const total = data.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
        setRent(total);
      });
    fetch('/api/expenses')
      .then(res => res.json())
      .then((data: Expense[]) => {
        const total = data.reduce((sum, e) => sum + (e.amount || 0), 0);
        setExpenses(total);
      });
  }, []);

  const net = rent - expenses;

  return (
    <div className="p-4 border rounded" data-testid="cashflow-tile">
      <h2 className="text-lg font-bold mb-2">Monthly Cashflow</h2>
      <p>Rent: ${rent}</p>
      <p>Expenses: ${expenses}</p>
      <p className="font-semibold">Net: ${net}</p>
    </div>
  );
}
