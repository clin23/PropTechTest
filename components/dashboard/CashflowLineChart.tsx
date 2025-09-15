import { ResponsiveContainer, LineChart, Line, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { TimeSeriesPoint } from '../../types/dashboard';
import { formatDate, formatMoney } from '../../lib/format';

interface Props {
  data: TimeSeriesPoint[];
}

export default function CashflowLineChart({ data }: Props) {
  return (
    <div className="p-4 rounded-2xl card">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} tick={{ fill: 'var(--text-secondary)' }} />
          <YAxis tickFormatter={(v) => formatMoney(v)} tick={{ fill: 'var(--text-secondary)' }} />
          <Tooltip formatter={(v: number) => formatMoney(v)} labelFormatter={(l) => formatDate(l)} />
          <Legend />
          <Line type="monotone" dataKey="cashInCents" name="Cash In" stroke="#22c55e" />
          <Line type="monotone" dataKey="cashOutCents" name="Cash Out" stroke="#ef4444" />
          <Line type="monotone" dataKey="netCents" name="Net" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
