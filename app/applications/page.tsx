import ApplicationsTable from '../../components/ApplicationsTable';

export default function ApplicationsPage() {
  const rows = [
    { id: '1', applicant: 'John Doe', property: '123 Main St', status: 'New' },
    { id: '2', applicant: 'Jane Smith', property: '456 Oak Ave', status: 'In Review' },
  ];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>
      <ApplicationsTable rows={rows} />
    </div>
  );
}
