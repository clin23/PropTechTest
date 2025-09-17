"use client";

import ExpensesTable from "../../../../../components/ExpensesTable";

interface ExpensesProps {
  propertyId: string;
}

export default function Expenses({ propertyId }: ExpensesProps) {
  return (
    <div className="space-y-4">
      <ExpensesTable propertyId={propertyId} />
    </div>
  );
}
