"use client";

import { useQuery } from "@tanstack/react-query";
import { listNotifications, Notification } from "../lib/api";
import Skeleton from "./Skeleton";

export default function AlertsPanel() {
  const { data, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });

  const alerts = data ?? [];

  return (
    <div className="space-y-2" data-testid="alerts">
      <h2 className="text-xl font-semibold">Alerts</h2>
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : alerts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No alerts</div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((n) => (
            <li key={n.id} className="p-2 border rounded">
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
