"use client";

import IncomesTable from "../../../../../components/IncomesTable";

interface OtherIncomeProps {
  propertyId: string;
}

const CORE_RENT_CATEGORIES = [
  "Base rent",
  "Rent",
  "Rent payment",
  "Core rent",
  "Arrears catch-up",
  "Arrears catchup",
];

export default function OtherIncome({ propertyId }: OtherIncomeProps) {
  return (
    <div className="space-y-4">
      <IncomesTable
        propertyId={propertyId}
        excludeCategories={CORE_RENT_CATEGORIES}
      />
    </div>
  );
}
