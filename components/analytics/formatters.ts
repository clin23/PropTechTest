'use client';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

export type ValueFormat = 'currency' | 'percentage' | 'number';

export function formatValue(value: number, format: ValueFormat = 'number', precision = 1) {
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

export function formatPercentage(value: number, precision = 1) {
  return `${value.toFixed(precision)}%`;
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
