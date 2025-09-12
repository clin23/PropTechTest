import Link from 'next/link';

export default function AnalyticsOverview() {
  return (
    <div className="p-6">
      <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Analytics
      </Link>
      <h1 className="text-2xl font-semibold mb-4 mt-2">Analytics Overview</h1>
      <p>Standardised visualisations will appear here.</p>
    </div>
  );
}
