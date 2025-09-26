'use client';

type Props = {
  title: string;
  value: number | null | undefined;
  format?: 'currency' | 'percentage' | 'number';
  precision?: number;
  subtitle?: string;
  tooltip?: string;
};

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

export function formatValue(
  value: number,
  format: Props['format'] = 'number',
  precision = 1,
) {
  switch (format) {
    case 'currency':
      return currencyFormatter.format(value);
    case 'percentage':
      return `${value.toFixed(precision)}%`;
    default:
      return value.toLocaleString('en-AU', {
        maximumFractionDigits: precision,
      });
  }
}

export function KpiCard({ title, value, format = 'number', precision = 1, subtitle, tooltip }: Props) {
  const display =
    value === null || value === undefined ? '—' : formatValue(value, format, precision);
  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm"
      role="status"
      aria-live="polite"
      title={tooltip}
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50" data-testid={`kpi-${title.replace(/\s+/g, '-').toLowerCase()}`}>
        {display}
      </p>
      {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
}

export default KpiCard;
