"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listReminders, Reminder } from "../lib/api";
import { bucketReminders } from "../lib/reminders";
import Skeleton from "./Skeleton";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ReminderColumn({
  title,
  items,
}: {
  title: string;
  items: Reminder[];
}) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">None</div>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                href={
                  r.type === "inspection_due"
                    ? `/properties/${r.propertyId}/inspections`
                    : `/properties/${r.propertyId}#key-dates`
                }
                className={`block p-2 border-l-4 rounded hover:bg-gray-50 ${
                  r.severity === "high"
                    ? "border-red-500"
                    : r.severity === "medium"
                    ? "border-yellow-500"
                    : "border-gray-300"
                }`}
              >
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-gray-500">{formatDate(r.dueDate)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function UpcomingReminders() {
  const { data, isLoading } = useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: listReminders,
  });

  const reminders = data ?? [];
  const { overdue, thisMonth, later } = bucketReminders(reminders);

  return (
    <div className="space-y-4" data-testid="reminders">
      <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No upcoming reminders
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <ReminderColumn title="Overdue" items={overdue} />
          <ReminderColumn title="This Month" items={thisMonth} />
          <ReminderColumn title="Later" items={later} />
        </div>
      )}
    </div>
  );
}
