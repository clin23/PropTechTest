"use client";

import PropertyDocumentsTable from "../../../../../components/PropertyDocumentsTable";

interface DocumentsProps {
  propertyId: string;
}

export default function Documents({ propertyId }: DocumentsProps) {
  return (
    <div className="space-y-4">
      <PropertyDocumentsTable propertyId={propertyId} />
    </div>
  );
}
