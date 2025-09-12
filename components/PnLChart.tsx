"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthlyNet {
  month: string;
  income?: number;
  expenses?: number;
  net: number;
}

export default function PnLChart({ data }: { data: MonthlyNet[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          {data.some((d) => d.income !== undefined) && (
            <Line
              type="monotone"
              dataKey="income"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
          )}
          {data.some((d) => d.expenses !== undefined) && (
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--chart-5)"
              strokeWidth={2}
              dot={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="net"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
