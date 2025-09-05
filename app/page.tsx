"use client";
import { useEffect, useState } from "react";
import CashflowTile from "../components/CashflowTile";
import DashboardPropertyCard, { DashboardProperty } from "../components/DashboardPropertyCard";
import UpcomingReminders from "../components/UpcomingReminders";
import QuickActionsBar from "../components/QuickActionsBar";

export default function Page() {
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  useEffect(() => {
    fetch('/api/properties').then(res => res.json()).then((data: DashboardProperty[]) => setProperties(data.slice(0, 3)));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <CashflowTile />
      <div className="grid gap-4 md:grid-cols-3">
        {properties.map((p) => (
          <DashboardPropertyCard key={p.id} property={p} />
        ))}
      </div>
      <UpcomingReminders />
      <QuickActionsBar />
    </div>
  );
}
