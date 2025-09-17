"use client";

import TenantCRMModule from "../../../../../components/TenantCRM";

interface TenantCRMProps {
  propertyId: string;
}

export default function TenantCRM({ propertyId }: TenantCRMProps) {
  return (
    <div className="space-y-4">
      <TenantCRMModule propertyId={propertyId} />
    </div>
  );
}
