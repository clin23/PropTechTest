"use client";

import IncomesTable from "../../../../../components/IncomesTable";
import { RENT_LEDGER_CATEGORY_NAMES } from "../../../../../lib/income-ledger";

interface OtherIncomeProps {
  propertyId: string;
}

export default function OtherIncome({ propertyId }: OtherIncomeProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <IncomesTable
          propertyId={propertyId}
          excludeCategories={[...RENT_LEDGER_CATEGORY_NAMES]}
        />
      </div>
    </div>
  );
}
