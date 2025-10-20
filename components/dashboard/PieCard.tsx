import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';
import { formatMoney } from '../../lib/format';

interface PieCardProps<T> {
  title: string;
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-5)',
  'var(--chart-4)',
  'var(--chart-6)',
];

const integerFormatter = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 });

const toRoundedDollars = (valueInCents: number) => Math.round(valueInCents / 100);

const renderSliceLabel = ({ value }: PieLabelRenderProps) => {
  if (typeof value !== 'number') return '';
  return integerFormatter.format(toRoundedDollars(value));
};

export default function PieCard<T extends Record<string, any>>({ title, data, labelKey, valueKey }: PieCardProps<T>) {
  const hasData = data.some((item) => {
    const value = item[valueKey];
    return typeof value === 'number' && value > 0;
  });

  return (
    <div className="p-4 rounded-2xl card">
      <div className="mb-4 text-sm text-text-secondary">{title}</div>
      {hasData ? (
        <div className="h-[320px] sm:h-[360px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
              <Pie
                data={data}
                dataKey={valueKey as string}
                nameKey={labelKey as string}
                label={renderSliceLabel}
                outerRadius="75%"
                labelLine
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[320px] items-center justify-center px-4 text-center text-sm text-text-secondary sm:h-[360px] lg:h-[400px]">
          Log data to see visualisations!
        </div>
      )}
    </div>
  );
}
