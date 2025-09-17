"use client";

import RentLedgerTable from "../../../../../components/RentLedgerTable";

interface RentLedgerProps {
  propertyId: string;
}

export default function RentLedger({ propertyId }: RentLedgerProps) {
  return (
    <div className="space-y-4">
      <RentLedgerTable propertyId={propertyId} />
    </div>
  );
}
