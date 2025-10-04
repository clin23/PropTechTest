"use client";

import RentLedgerTable from "../../../../../components/RentLedgerTable";

interface RentLedgerProps {
  propertyId: string;
}

export default function RentLedger({ propertyId }: RentLedgerProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <RentLedgerTable propertyId={propertyId} />
      </div>
    </div>
  );
}
