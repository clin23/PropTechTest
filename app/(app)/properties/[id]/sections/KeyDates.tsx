"use client";

import UpcomingReminders from "../../../../../components/UpcomingReminders";

interface KeyDatesProps {
  propertyId: string;
}

export default function KeyDates({ propertyId }: KeyDatesProps) {
  return (
    <div className="space-y-4">
      <UpcomingReminders propertyId={propertyId} />
    </div>
  );
}
