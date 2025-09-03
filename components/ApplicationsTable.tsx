export interface ApplicationRow {
  id: string;
  applicant: string;
  property: string;
  status: string;
}

export default function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Applicant</th>
          <th className="p-2 text-left">Property</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-t">
            <td className="p-2">{r.applicant}</td>
            <td className="p-2">{r.property}</td>
            <td className="p-2">{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
