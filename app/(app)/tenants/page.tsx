import TenantCRM from '../../../components/TenantCRM';

export const metadata = {
  title: 'Tenant CRM',
};

export default function TenantDirectoryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tenant CRM</h1>
        <p className="text-sm text-muted-foreground">
          Manage tenant notes, contact history, and preferences from a central directory.
        </p>
      </header>
      <TenantCRM />
    </div>
  );
}
