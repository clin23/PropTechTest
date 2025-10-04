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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <IncomesTable
          propertyId={propertyId}
          excludeCategories={CORE_RENT_CATEGORIES}
        />
      </div>
    </div>
  );
}
