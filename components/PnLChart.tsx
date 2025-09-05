"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyNet {
  month: string;
  net: number;
}

export default function PnLChart({ data }: { data: MonthlyNet[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="currentColor" />
          <YAxis stroke="currentColor" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #ffffff)",
              borderColor: "var(--tooltip-border, #e5e7eb)",
              color: "var(--tooltip-text, #000000)",
            }}
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="var(--color-net, rgb(75,192,192))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

