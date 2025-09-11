import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VizLine from '../app/(app)/analytics/components/VizLine';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('VizLine', () => {
  const sample = [{ label: '2024-01', income: 100, expenses: 50, net: 50 }];

  it('shows only income line when only income is enabled', () => {
    const { container } = render(
      <VizLine data={sample} showIncome showExpenses={false} showNet={false} />
    );
    expect(container.querySelector('path[stroke="#3b82f6"]')).not.toBeNull();
    expect(container.querySelector('path[stroke="#ef4444"]')).toBeNull();
    expect(container.querySelector('path[stroke="#10b981"]')).toBeNull();
  });

  it('renders axes without data', () => {
    const { container } = render(
      <VizLine data={[]} showIncome={false} showExpenses={false} showNet={false} />
    );
    expect(container.querySelector('path[stroke="#3b82f6"]')).toBeNull();
    expect(container.querySelector('path[stroke="#ef4444"]')).toBeNull();
    expect(container.querySelector('path[stroke="#10b981"]')).toBeNull();
    expect(container.querySelectorAll('.recharts-cartesian-axis').length).toBe(2);
  });
});
