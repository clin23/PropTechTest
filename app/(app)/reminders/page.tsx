"use client";

import UpcomingReminders from "../../../components/UpcomingReminders";

export default function RemindersPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reminders</h1>
      <UpcomingReminders />
    </div>
  );
}

