"use client";

import PropertyRentReview from "../../../../../components/PropertyRentReview";

interface RentReviewProps {
  propertyId: string;
}

export default function RentReview({ propertyId }: RentReviewProps) {
  return (
    <div className="space-y-4">
      <PropertyRentReview propertyId={propertyId} />
    </div>
  );
}
