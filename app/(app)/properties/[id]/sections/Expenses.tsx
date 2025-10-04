"use client";

import ExpensesTable from "../../../../../components/ExpensesTable";

interface ExpensesProps {
  propertyId: string;
}

export default function Expenses({ propertyId }: ExpensesProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <ExpensesTable propertyId={propertyId} />
      </div>
    </div>
  );
}
