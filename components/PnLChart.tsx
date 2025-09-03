"use client";

import { useQuery } from "@tanstack/react-query";
import { getPnL } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PnLChart({ propertyId }: { propertyId: string }) {
  const { data = [] } = useQuery<any[]>(["pnl", propertyId], () =>
    getPnL(propertyId)
  );

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#4ade80" />
          <Line type="monotone" dataKey="expenses" stroke="#f87171" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
