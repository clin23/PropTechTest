import Link from "next/link";
import type { PropertySummary } from "../types/summary";

export default function DashboardPropertyCard({ property }: { property: PropertySummary }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="block p-4 border rounded hover:bg-gray-50"
    >
      <h3 className="font-semibold">{property.address}</h3>
      <div className="text-sm">Tenant: {property.tenantName}</div>
      <div className="text-sm">Rent: {property.rentStatus}</div>
      <div className="text-sm">Next: {property.nextKeyDate}</div>
    </Link>
  );
}
