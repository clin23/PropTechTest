"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "./ui/use-toast";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import { zPnlSummary } from "../lib/validation";
import type { PnlSummary } from "../types/pnl";

export default function DashboardPnlMiniChart() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<PnlSummary>({
    queryKey: ["pnl-summary", "last6m"],
    queryFn: async () => {
      const res = await fetch("/api/pnl/summary?period=last6m");
      const json = await res.json();
      return zPnlSummary.parse(json);
    },
    onError: () => toast({ title: "Failed to load P&L" }),
  });

  if (isLoading) {
    return <Skeleton className="h-40" />;
  }

  if (!data || data.series.length === 0) {
    return (
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">P&L Trend (Last 6 months)</h2>
        <EmptyState message="Not enough data yet" />
      </div>
    );
  }

  const { totals, series } = data;

  return (
    <div className="p-4 border rounded" data-testid="pnl-mini">
      <h2 className="font-semibold mb-2">P&L Trend (Last 6 months)</h2>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #ffffff)",
                borderColor: "var(--tooltip-border, #e5e7eb)",
                color: "var(--tooltip-text, #000000)",
              }}
              formatter={(_, __, props) => [props.payload.net, props.payload.month]}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="currentColor"
              fill="currentColor"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs mt-2">
        <div>Income: {totals.income}</div>
        <div>Expenses: {totals.expenses}</div>
        <div>Net: {totals.net}</div>
      </div>
    </div>
  );
}
