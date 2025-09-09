"use client";
import { useEffect, useState } from "react";
import CashflowTile from "../../../components/CashflowTile";
import DashboardPnlMiniChart from "../../../components/DashboardPnlMiniChart";
import DashboardPropertyCard from "../../../components/DashboardPropertyCard";
import Skeleton from "../../../components/Skeleton";
import UpcomingReminders from "../../../components/UpcomingReminders";
import AlertsPanel from "../../../components/AlertsPanel";
import { useToast } from "../../../components/ui/use-toast";
import { z } from "zod";
import type { PropertySummary } from "../../../types/summary";

const schema = z.array(
  z.object({
    id: z.string(),
    address: z.string(),
    tenantName: z.string(),
    rentStatus: z.string(),
    nextKeyDate: z.string(),
  })
);

export default function DashboardPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/summary/properties")
      .then((res) => res.json())
      .then((json) => schema.parse(json))
      .then(setProperties)
      .catch(() => toast({ title: "Failed to load properties" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardPnlMiniChart />
        <CashflowTile />
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          properties.slice(0, 2).map((p) => (
            <DashboardPropertyCard key={p.id} property={p} />
          ))
        )}
      </div>
      <AlertsPanel />
      <UpcomingReminders showViewAll />
    </div>
  );
}
