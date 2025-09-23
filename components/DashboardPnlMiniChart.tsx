"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "./ui/use-toast";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import { zPnlSummary } from "../lib/validation";
import type { PnlSummary } from "../types/pnl";
import { useRouter } from "next/navigation";

export default function DashboardPnlMiniChart() {
  const { toast } = useToast();
  const router = useRouter();
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
      <div className="p-4 bg-bg-surface border border-[var(--border)] rounded shadow-sm">
        <h2 className="font-semibold mb-2">P&L Trend (Last 6 months)</h2>
        <EmptyState message="Not enough data yet" />
      </div>
    );
  }

  const { totals, series } = data;

  return (
    <div
      className="p-4 bg-bg-surface border border-[var(--border)] rounded shadow-sm group cursor-pointer"
      data-testid="pnl-mini"
      onClick={() => router.push("/analytics")}
      role="link"
    >
      <h2 className="font-semibold mb-2">P&L Trend (Last 6 months)</h2>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              formatter={(_, __, props) => [props.payload.net, props.payload.month]}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs mt-2 opacity-0 group-hover:opacity-100 text-text-secondary">
        <div>Income: {totals.income}</div>
        <div>Expenses: {totals.expenses}</div>
        <div>Net: {totals.net}</div>
      </div>
    </div>
  );
}
