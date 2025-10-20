'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { OverviewState } from '../lib/urlState';

type BaseParams = Pick<OverviewState, 'from' | 'to' | 'propertyIds'>;

type KpiResponse = {
  netCashflow: number;
  grossYield: number | null;
  occupancyRate: number | null;
  onTimeCollection: number | null;
  portfolioRoi?: number | null;
};

type CashflowBucket = {
  label: string;
  income: number;
  expenses: number;
  net: number;
};

type CashflowResponse = {
  buckets: CashflowBucket[];
  granularity: 'month' | 'week';
};

type ExpenseBreakdownResponse = {
  total: number;
  items: { category: string; value: number }[];
};

type PropertySeriesResponse = {
  items: { propertyId: string; propertyLabel: string; net: number }[];
};

type UpcomingResponse = {
  items: {
    type: 'lease' | 'insurance' | 'smokeAlarm' | 'inspection';
    label: string;
    dueOn: string;
    propertyLabel: string;
  }[];
};

type PropertySummary = {
  id: string;
  address: string;
  imageUrl?: string;
  rent: number;
  leaseStart: string;
  leaseEnd: string;
  tenant: string;
  value?: number;
};

function buildQuery(params: BaseParams) {
  const search = new URLSearchParams();
  search.set('from', params.from);
  search.set('to', params.to);
  if (params.propertyIds.length) {
    search.set('propertyIds', params.propertyIds.join(','));
  }
  return search.toString();
}

async function fetchJson<T>(path: string, params: BaseParams): Promise<T> {
  const query = buildQuery(params);
  const url = `${path}?${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
}

export function useOverviewKpis(params: BaseParams, enabled = true) {
  return useQuery<KpiResponse>({
    queryKey: ['analytics-kpis', params],
    queryFn: () => fetchJson('/api/analytics/kpis', params),
    staleTime: 30_000,
    enabled,
  });
}

export function useCashflowSeries(params: BaseParams, enabled = true) {
  return useQuery<CashflowResponse>({
    queryKey: ['analytics-cashflow', params],
    queryFn: () => fetchJson('/api/analytics/series/cashflow', params),
    staleTime: 30_000,
    enabled,
  });
}

export function useExpenseBreakdown(params: BaseParams, enabled = true) {
  return useQuery<ExpenseBreakdownResponse>({
    queryKey: ['analytics-expense-breakdown', params],
    queryFn: () => fetchJson('/api/analytics/breakdown/expenses', params),
    staleTime: 30_000,
    enabled,
  });
}

export function usePropertySeries(params: BaseParams, enabled = true) {
  return useQuery<PropertySeriesResponse>({
    queryKey: ['analytics-property-series', params],
    queryFn: () => fetchJson('/api/analytics/series/by-property', params),
    staleTime: 30_000,
    enabled,
  });
}

export function useUpcoming(params: BaseParams, enabled = true) {
  const search = useMemo(() => {
    const q = new URLSearchParams();
    q.set('limit', '5');
    q.set('from', params.from);
    q.set('to', params.to);
    if (params.propertyIds.length) {
      q.set('propertyIds', params.propertyIds.join(','));
    }
    return q.toString();
  }, [params.from, params.to, params.propertyIds]);

  return useQuery<UpcomingResponse>({
    queryKey: ['analytics-upcoming', params],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/upcoming?${search}`);
      if (!response.ok) throw new Error('Failed to load upcoming obligations');
      return response.json();
    },
    staleTime: 30_000,
    enabled,
  });
}

export function useProperties() {
  return useQuery<PropertySummary[]>({
    queryKey: ['analytics-properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    staleTime: 60_000,
  });
}
