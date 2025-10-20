'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  buildSearchParams,
  defaultState,
  isSameState,
  parseStateFromSearch,
  type OverviewState,
} from '../../app/(app)/analytics/overview/lib/urlState';

export type ChartView = 'cashflow' | 'yield' | 'expenses';

type AnalyticsFiltersContextValue = {
  filters: OverviewState;
  activeFilters: OverviewState;
  setFilters: React.Dispatch<React.SetStateAction<OverviewState>>;
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
};

const AnalyticsFiltersContext = createContext<AnalyticsFiltersContextValue | null>(null);

export function AnalyticsFiltersProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = useMemo(() => searchParams.toString(), [searchParams]);
  const initialFromUrl = useMemo(
    () => parseStateFromSearch(new URLSearchParams(searchKey)),
    [searchKey],
  );

  const [filters, setFilters] = useState<OverviewState>(initialFromUrl ?? defaultState());
  const [activeFilters, setActiveFilters] = useState<OverviewState>(filters);
  const [chartView, setChartView] = useState<ChartView>('cashflow');

  useEffect(() => {
    const handler = window.setTimeout(() => setActiveFilters(filters), 250);
    return () => window.clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    if (!initialFromUrl) {
      return;
    }

    setFilters((previous) => {
      if (isSameState(previous, initialFromUrl)) {
        return previous;
      }
      setActiveFilters(initialFromUrl);
      return initialFromUrl;
    });
  }, [initialFromUrl]);

  useEffect(() => {
    const params = buildSearchParams(activeFilters).toString();
    if (params === searchKey) return;
    router.replace(`?${params}`, { scroll: false });
  }, [activeFilters, router, searchKey]);

  const value = useMemo(
    () => ({ filters, activeFilters, setFilters, chartView, setChartView }),
    [filters, activeFilters, chartView],
  );

  return <AnalyticsFiltersContext.Provider value={value}>{children}</AnalyticsFiltersContext.Provider>;
}

export function useAnalyticsFilters() {
  const context = useContext(AnalyticsFiltersContext);
  if (!context) {
    throw new Error('useAnalyticsFilters must be used within AnalyticsFiltersProvider');
  }
  return context;
}
