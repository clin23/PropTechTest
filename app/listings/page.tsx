import Link from 'next/link';

export default function ListingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Listings</h1>
      <Link href="/listings/new" className="text-blue-600 underline">
        Create Listing
      </Link>
    </div>
  );
}
