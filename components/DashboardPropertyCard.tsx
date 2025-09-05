export interface DashboardProperty {
  id: string;
  address: string;
  tenant: string;
  rentStatus: string;
  leaseExpiry: string;
}

export default function DashboardPropertyCard({ property }: { property: DashboardProperty }) {
  return (
    <div className="p-4 border rounded" data-testid="property-card">
      <h3 className="font-semibold">{property.address}</h3>
      <div className="text-sm">Tenant: {property.tenant}</div>
      <div className="text-sm">Rent: {property.rentStatus}</div>
      <div className="text-sm">Lease Expiry: {property.leaseExpiry}</div>
    </div>
  );
}
