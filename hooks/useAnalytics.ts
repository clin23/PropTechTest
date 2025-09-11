import { useQuery, useMutation } from '@tanstack/react-query';
import type { AnalyticsStateType } from '../lib/schemas';

async function fetchJson(url: string, params?: any) {
  const u = new URL(url, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) u.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    });
  }
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export function useSeries(params: AnalyticsStateType) {
  return useQuery({
    queryKey: ['series', params],
    queryFn: () => fetchJson('/api/analytics/series', params),
    staleTime: 30_000,
  });
}

export function useBreakdown(params: any) {
  return useQuery({
    queryKey: ['breakdown', params],
    queryFn: () => fetchJson('/api/analytics/breakdown', params),
    staleTime: 30_000,
  });
}

export function usePresets() {
  return useQuery({
    queryKey: ['presets'],
    queryFn: () => fetchJson('/api/analytics/presets'),
  });
}

export function useSavePreset() {
  return useMutation({
    mutationFn: (body: any) =>
      fetch('/api/analytics/presets', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json()),
  });
}
