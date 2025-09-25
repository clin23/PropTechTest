import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AnalyticsOverviewPage from '../app/(app)/analytics/overview/page';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/dynamic', () => ({
  default: () =>
    React.forwardRef<HTMLDivElement, any>((props, ref) => (
      <div ref={ref} data-testid={props['data-testid'] ?? 'chart-stub'} />
    )),
}));

const baseResponses = {
  '/api/properties': [
    { id: '1', address: '123 Main St', rent: 1200, leaseStart: '2025-03-01', leaseEnd: '2026-02-28', tenant: 'Alice' },
    { id: '2', address: '456 Oak Ave', rent: 950, leaseStart: '2025-04-01', leaseEnd: '2026-03-31', tenant: 'Bob' },
  ],
  '/api/analytics/kpis': {
    netCashflow: 4200,
    grossYield: 5.3,
    occupancyRate: 92,
    onTimeCollection: 88,
  },
  '/api/analytics/series/cashflow': {
    buckets: [
      { label: '2025-07', income: 3200, expenses: 1000, net: 2200 },
      { label: '2025-08', income: 3200, expenses: 1200, net: 2000 },
    ],
    granularity: 'month',
  },
  '/api/analytics/breakdown/expenses': {
    total: 2200,
    items: [
      { category: 'Repairs', value: 600 },
      { category: 'Rates', value: 400 },
    ],
  },
  '/api/analytics/series/by-property': {
    items: [
      { propertyId: '1', propertyLabel: '123 Main St', net: 1800 },
      { propertyId: '2', propertyLabel: '456 Oak Ave', net: 1400 },
    ],
  },
  '/api/analytics/upcoming': {
    items: [
      { type: 'lease', label: 'Lease expires', dueOn: '2025-10-01', propertyLabel: '123 Main St' },
    ],
  },
};

function setupFetch(overrides: Record<string, any> = {}) {
  const responses = { ...baseResponses, ...overrides };
  const fetchMock = vi.fn(async (input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.url;
    const { pathname } = new URL(url, 'http://localhost');
    const match = responses[pathname];
    if (match === undefined) {
      return new Response('Not found', { status: 404 });
    }
    const body = typeof match === 'function' ? await match(url) : match;
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function renderPage() {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <AnalyticsOverviewPage />
    </QueryClientProvider>,
  );
}

describe('AnalyticsOverviewPage', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-15T10:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    replaceMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders FYTD KPIs with mock API data', async () => {
    setupFetch();
    renderPage();

    const netCashflow = await screen.findByTestId('kpi-net-cashflow');
    expect(netCashflow.textContent).toContain('4,200');
    expect(screen.getByTestId('kpi-gross-yield').textContent).toContain('5.3');
    expect(screen.getByTestId('kpi-occupancy-rate').textContent).toContain('92');
  });

  it('updates queries when selecting a preset', async () => {
    const fetchMock = setupFetch();
    renderPage();

    await screen.findByTestId('kpi-net-cashflow');
    fireEvent.click(screen.getByText('This Month'));

    await waitFor(() => {
      const calls = fetchMock.mock.calls
        .map(([request]) => (typeof request === 'string' ? request : request.url))
        .filter((url) => url.includes('/api/analytics/kpis'));
      expect(calls[calls.length - 1]).toContain('from=2025-09-01');
    });
  });

  it('applies property filters across queries', async () => {
    const fetchMock = setupFetch();
    renderPage();

    await screen.findByText('All properties');
    fireEvent.click(screen.getByLabelText('123 Main St'));
    fireEvent.click(screen.getByLabelText('456 Oak Ave'));

    await waitFor(() => {
      const propertyCalls = fetchMock.mock.calls
        .map(([request]) => (typeof request === 'string' ? request : request.url))
        .filter((url) => url.includes('/api/analytics/kpis'));
      expect(propertyCalls[propertyCalls.length - 1]).toContain('propertyIds=1,2');
    });
  });

  it('shows zero state when no data available', async () => {
    setupFetch({
      '/api/analytics/kpis': { netCashflow: 0, grossYield: null, occupancyRate: null, onTimeCollection: null },
      '/api/analytics/series/cashflow': { buckets: [], granularity: 'month' },
      '/api/analytics/breakdown/expenses': { total: 0, items: [] },
      '/api/analytics/series/by-property': { items: [] },
      '/api/analytics/upcoming': { items: [] },
    });
    renderPage();

    expect(await screen.findByText('No data for this range.')).toBeInTheDocument();
  });
});
