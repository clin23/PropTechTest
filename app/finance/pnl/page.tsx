import PnLChart from '../../../components/PnLChart';

export default function PnLPage() {
  // TODO: replace hard-coded property ID with route param when available
  const propertyId = "1";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">P&L</h1>
      <PnLChart propertyId={propertyId} />
    </div>
  );
}
