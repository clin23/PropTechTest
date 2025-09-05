import UpcomingReminders from "../components/UpcomingReminders";
import PropertyCard from "../components/PropertyCard";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <UpcomingReminders />
      <PropertyCard propertyId="property1" address="10 Rose St" />
    </div>
  );
}
