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
                className={`block p-2 border-l-4 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  r.severity === "high"
                    ? "border-red-500"
                    : r.severity === "med"
                    ? "border-yellow-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{r.title}</div>
                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5">
                    {r.propertyAddress}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{formatDate(r.dueDate)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props {
  propertyId?: string;
  showViewAll?: boolean;
}

export default function UpcomingReminders({
  propertyId,
  showViewAll,
}: Props) {
  const { data, isLoading } = useQuery<Reminder[]>({
    queryKey: ["reminders", propertyId],
    queryFn: () => listReminders(propertyId ? { propertyId } : undefined),
  });

  const reminders = data ?? [];
  const { overdue, thisMonth, later } = bucketReminders(reminders);
  const gridCols = propertyId ? "" : "md:grid-cols-3";

  return (
    <div className="space-y-4" data-testid="reminders">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
        {showViewAll && (
          <Link href="/reminders" className="text-sm text-blue-600">
            View all
          </Link>
        )}
      </div>
      {isLoading ? (
        <div className={`grid gap-4 ${gridCols}`}>
          <Skeleton className="h-24" />
          {!propertyId && (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          )}
        </div>
      ) : reminders.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Nothing urgent 🎉
        </div>
      ) : (
        <div className={`grid gap-4 ${gridCols}`}>
          <ReminderColumn title="Overdue" items={overdue} />
          <ReminderColumn title="This Month" items={thisMonth} />
          <ReminderColumn title="Later" items={later} />
        </div>
      )}
    </div>
  );
}
