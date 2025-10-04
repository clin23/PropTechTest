"use client";

import PropertyDocumentsTable from "../../../../../components/PropertyDocumentsTable";

interface DocumentsProps {
  propertyId: string;
}

export default function Documents({ propertyId }: DocumentsProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <PropertyDocumentsTable propertyId={propertyId} />
      </div>
    </div>
  );
}
