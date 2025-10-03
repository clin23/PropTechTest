import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import ChartRenderer from '../app/(app)/analytics/components/ChartRenderer';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('ChartRenderer', () => {
  const sample = [
    { label: '2024-01', income: 100, expenses: 50, net: 50 },
    { label: '2024-02', income: 150, expenses: 75, net: 75 },
  ];

  it('renders line series for provided keys', () => {
    const { container } = render(
      <ChartRenderer
        type="line"
        data={sample}
        xKey="label"
        yKeys={[
          { key: 'income', label: 'Income', color: 'var(--chart-2)' },
          { key: 'expenses', label: 'Expenses', color: 'var(--chart-5)' },
        ]}
      />
    );

    expect(container.querySelector('path[stroke="var(--chart-2)"]')).not.toBeNull();
    expect(container.querySelector('path[stroke="var(--chart-5)"]')).not.toBeNull();
  });

  it('shows placeholder when no data is available', () => {
    render(
      <ChartRenderer
        type="bar"
        data={[]}
        xKey="label"
        yKeys={[{ key: 'income', label: 'Income', color: 'var(--chart-2)' }]}
      />
    );

    expect(
      screen.getByText('No data available for the current filters')
    ).toBeInTheDocument();
  });
});

