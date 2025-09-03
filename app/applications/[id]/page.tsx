import ApplicantTabs from '../../../components/ApplicantTabs';

export default function ApplicationDetail({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Application {params.id}</h1>
      <ApplicantTabs />
    </div>
  );
}
