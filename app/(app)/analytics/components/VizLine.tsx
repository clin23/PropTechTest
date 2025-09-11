import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { label: string; income: number; expenses: number; net: number }[];
  showIncome?: boolean;
  showExpenses?: boolean;
  showNet?: boolean;
}

const formatLabel = (label: string) => {
  const [year, month] = label.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  const monthName = date.toLocaleString('default', { month: 'short' });
  return `${monthName} '${year.slice(2)}`;
};

export default function VizLine({ data, showIncome = true, showExpenses = true, showNet = true }: Props) {
  const hasData = data.length > 0;
  const chartData = hasData ? data : [{ label: '', income: 0, expenses: 0, net: 0 }];
  return (
    <div data-testid="viz-line" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="label" tickFormatter={formatLabel} />
          <YAxis />
          <Tooltip
            labelFormatter={formatLabel}
            formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend />
          {showNet && hasData && (
            <Line type="monotone" dataKey="net" stroke="#10b981" name="Net" dot={false} />
          )}
          {showIncome && hasData && (
            <Line type="monotone" dataKey="income" stroke="#3b82f6" name="Income" dot={false} />
          )}
          {showExpenses && hasData && (
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
