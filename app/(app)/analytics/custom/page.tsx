import Link from 'next/link';

export default function CustomAnalytics() {
  return (
    <div className="p-6">
      <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Analytics
      </Link>
      <h1 className="text-2xl font-semibold mb-4 mt-2">Custom Analytics</h1>
      <p>Saved analytics will be accessible here.</p>
    </div>
  );
}
