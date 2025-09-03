import VendorCard from '../../components/VendorCard';

export default function VendorsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Vendors</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <VendorCard />
        <VendorCard />
      </div>
    </div>
  );
}
