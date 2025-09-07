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
  income?: number;
  expenses?: number;
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
          {data.some((d) => d.income !== undefined) && (
            <Line
              type="monotone"
              dataKey="income"
              stroke="var(--color-income, rgb(34,197,94))"
              strokeWidth={2}
              dot={false}
            />
          )}
          {data.some((d) => d.expenses !== undefined) && (
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses, rgb(239,68,68))"
              strokeWidth={2}
              dot={false}
            />
          )}
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

