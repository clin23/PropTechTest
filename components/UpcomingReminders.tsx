"use client";

import { useQuery } from "@tanstack/react-query";
import { listReminders, listNotifications, Reminder, Notification } from "../lib/api";

export default function UpcomingReminders() {
  const { data: reminders } = useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: listReminders,
  });
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
      <ul className="list-disc pl-6 space-y-1">
        {reminders?.map((r) => (
          <li key={r.id}>{r.message}</li>
        ))}
      </ul>
      {notifications && notifications.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <ul className="list-disc pl-6 space-y-1">
            {notifications.map((n) => (
              <li key={n.id}>{n.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
