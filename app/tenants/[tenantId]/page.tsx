import TenantProfile from "../../../components/tenant-crm/TenantProfile";

interface TenantProfilePageProps {
  params: { tenantId: string };
}

export function generateMetadata({ params }: TenantProfilePageProps) {
  return { title: `Tenant · ${params.tenantId}` };
}

export default function TenantProfilePage({ params }: TenantProfilePageProps) {
  return (
    <div className="space-y-6">
      <TenantProfile tenantId={params.tenantId} />
    </div>
  );
}
