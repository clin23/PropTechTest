import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { label: string; income: number; expenses: number; net: number }[];
}

const formatLabel = (label: string) => {
  const [year, month] = label.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  const monthName = date.toLocaleString('default', { month: 'short' });
  return `${monthName} '${year.slice(2)}`;
};

export default function VizLine({ data }: Props) {
  return (
    <div data-testid="viz-line" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" tickFormatter={formatLabel} />
          <YAxis />
          <Tooltip
            labelFormatter={formatLabel}
            formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend />
          <Line type="monotone" dataKey="net" stroke="#10b981" name="Net" dot={false} />
          <Line type="monotone" dataKey="income" stroke="#3b82f6" name="Income" dot={false} />
          <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
