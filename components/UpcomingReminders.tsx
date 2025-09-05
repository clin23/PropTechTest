"use client";
import { useEffect, useState } from "react";

interface Reminder { id: string; title: string; date: string }

export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  useEffect(() => {
    fetch('/api/reminders').then(res => res.json()).then(setReminders);
  }, []);
  return (
    <div className="p-4 border rounded" data-testid="reminders">
      <h2 className="text-lg font-bold mb-2">Upcoming Reminders</h2>
      <ul className="list-disc pl-5">
        {reminders.map(r => (
          <li key={r.id}>{r.title} - {r.date}</li>
        ))}
      </ul>
    </div>
  );
}
