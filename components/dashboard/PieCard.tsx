import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatMoney } from '../../lib/format';

interface PieCardProps<T> {
  title: string;
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
}

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#e11d48', '#8b5cf6', '#14b8a6'];

export default function PieCard<T extends Record<string, any>>({ title, data, labelKey, valueKey }: PieCardProps<T>) {
  return (
    <div className="p-4 rounded-2xl card">
      <div className="mb-4 text-sm text-text-secondary">{title}</div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey={valueKey as string} nameKey={labelKey as string} label>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => formatMoney(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
