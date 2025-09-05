"use client";

import { useQuery } from "@tanstack/react-query";
import { listNotifications, Notification } from "../lib/api";

interface Props {
  propertyId: string;
  address: string;
}

export default function PropertyCard({ propertyId, address }: Props) {
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });
  const alerts = notifications?.filter((n) => n.propertyId === propertyId) || [];

  return (
    <div className="border rounded p-4">
      <h2 className="text-xl font-semibold">{address}</h2>
      {alerts.map((a) => (
        <div
          key={a.id}
          className="mt-2 bg-red-100 text-red-800 px-2 py-1 rounded"
        >
          {a.message}
        </div>
      ))}
    </div>
  );
}
