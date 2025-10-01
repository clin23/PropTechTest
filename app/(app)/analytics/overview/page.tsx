"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "../../../../components/Skeleton";
import { SharedTile } from "../../../../components/SharedTile";

const PRESET_DEFINITIONS = [
  {
    id: "fytd" as const,
    label: "FYTD",
    resolveRange: (today: Date) => ({
      from: new Date(today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1, 6, 1),
      to: today,
    }),
  },
  {
    id: "this-month" as const,
    label: "This Month",
    resolveRange: (today: Date) => ({
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
    }),
  },
  {
    id: "last-quarter" as const,
    label: "Last Quarter",
    resolveRange: (today: Date) => {
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const startQuarter = Math.max(0, currentQuarter - 1);
      const yearOffset = startQuarter === 3 && currentQuarter === 0 ? -1 : 0;
      const year = today.getFullYear() + yearOffset;
      const startMonth = startQuarter * 3;
      const from = new Date(year, startMonth, 1);
      const to = new Date(year, startMonth + 3, 0);
      return { from, to };
    },
  },
];

type PresetId = (typeof PRESET_DEFINITIONS)[number]["id"];

type AnalyticsKpis = {
  netCashflow: number;
  grossYield: number | null;
  occupancyRate: number | null;
  onTimeCollection: number | null;
};

type CashflowSeries = {
  buckets: { label: string; income: number; expenses: number; net: number }[];
  granularity: string;
};

type BreakdownResponse = {
  total: number;
  items: { category: string; value: number }[];
};

type PropertySeriesResponse = {
  items: { propertyId: string; propertyLabel: string; net: number }[];
};

type UpcomingResponse = {
  items: { type: string; label: string; dueOn: string; propertyLabel?: string }[];
};

type PropertySummary = { id: string; address: string };

const formatISODate = (date: Date) => date.toISOString().slice(0, 10);

async function fetchJson<T>(path: string, params: Record<string, string | undefined> = {}) {
  const url = new URL(path, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, value);
  });
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to load analytics");
  }
  return (await response.json()) as T;
}

const numberFormatter = new Intl.NumberFormat("en-AU");

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

function formatCurrency(value: number | null | undefined) {
  if (!value) return "0";
  return numberFormatter.format(Math.round(value));
}

export default function AnalyticsOverviewPage() {
  const today = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState<PresetId>("fytd");
  const [range, setRange] = useState(() => PRESET_DEFINITIONS[0]!.resolveRange(today));
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const params = useMemo(() => {
    const base = {
      from: formatISODate(range.from),
      to: formatISODate(range.to),
    } as Record<string, string>;
    if (selectedProperties.length) {
      base.propertyIds = selectedProperties.join(",");
    }
    return base;
  }, [range.from, range.to, selectedProperties]);

  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["analytics", "properties"],
    queryFn: () => fetchJson<PropertySummary[]>("/api/properties"),
  });

  const { data: kpis, isLoading: kpiLoading } = useQuery<AnalyticsKpis>({
    queryKey: ["analytics", "kpis", params],
    queryFn: () => fetchJson<AnalyticsKpis>("/api/analytics/kpis", params),
  });

  const { data: cashflow, isLoading: seriesLoading } = useQuery<CashflowSeries>({
    queryKey: ["analytics", "series", params],
    queryFn: () => fetchJson<CashflowSeries>("/api/analytics/series/cashflow", params),
  });

  const { data: breakdown } = useQuery<BreakdownResponse>({
    queryKey: ["analytics", "breakdown", params],
    queryFn: () => fetchJson<BreakdownResponse>("/api/analytics/breakdown/expenses", params),
  });

  const { data: propertySeries } = useQuery<PropertySeriesResponse>({
    queryKey: ["analytics", "series", "property", params],
    queryFn: () => fetchJson<PropertySeriesResponse>("/api/analytics/series/by-property", params),
  });

  const { data: upcoming } = useQuery<UpcomingResponse>({
    queryKey: ["analytics", "upcoming", params],
    queryFn: () => fetchJson<UpcomingResponse>("/api/analytics/upcoming", params),
  });

  const isLoading = kpiLoading || seriesLoading;

  const hasData = Boolean(
    (kpis && (kpis.netCashflow || kpis.grossYield || kpis.occupancyRate || kpis.onTimeCollection)) ||
      (cashflow?.buckets?.length ?? 0) > 0 ||
      (breakdown?.items?.length ?? 0) > 0 ||
      (propertySeries?.items?.length ?? 0) > 0 ||
      (upcoming?.items?.length ?? 0) > 0,
  );

  const handlePresetChange = (id: PresetId) => {
    setPreset(id);
    const presetDef = PRESET_DEFINITIONS.find((item) => item.id === id);
    if (presetDef) {
      setRange(presetDef.resolveRange(today));
    }
  };

  const toggleProperty = (id: string) => {
    setSelectedProperties((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Analytics Overview</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track financial health, occupancy, and upcoming activity across your portfolio.
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        {PRESET_DEFINITIONS.map((item) => {
          const isActive = item.id === preset;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePresetChange(item.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                isActive
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">All properties</div>
        <div className="flex flex-wrap gap-3">
          {properties.map((property) => {
            const checked = selectedProperties.includes(property.id);
            return (
              <label
                key={property.id}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                  checked={checked}
                  onChange={() => toggleProperty(property.id)}
                  aria-label={property.address}
                />
                {property.address}
              </label>
            );
          })}
        </div>
        {selectedProperties.length > 0 && (
          <button
            type="button"
            className="text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSelectedProperties([])}
          >
            Clear selection
          </button>
        )}
      </section>

      <section>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SharedTile key={index}>
                <Skeleton className="h-16 w-full" />
              </SharedTile>
            ))}
          </div>
        ) : hasData ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SharedTile>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Net Cashflow</div>
                  <div data-testid="kpi-net-cashflow" className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    ${formatCurrency(kpis?.netCashflow ?? 0)}
                  </div>
                </div>
              </SharedTile>
              <SharedTile>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Gross Yield</div>
                  <div data-testid="kpi-gross-yield" className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {formatPercent(kpis?.grossYield ?? null)}
                  </div>
                </div>
              </SharedTile>
              <SharedTile>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</div>
                  <div data-testid="kpi-occupancy-rate" className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {formatPercent(kpis?.occupancyRate ?? null)}
                  </div>
                </div>
              </SharedTile>
              <SharedTile>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">On-time Collection</div>
                  <div data-testid="kpi-on-time" className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {formatPercent(kpis?.onTimeCollection ?? null)}
                  </div>
                </div>
              </SharedTile>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SharedTile>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-50">Cashflow trend</h2>
                <div className="space-y-2">
                  {cashflow?.buckets?.map((bucket) => (
                    <div key={bucket.label} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm dark:border-gray-800">
                      <span>{bucket.label}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${formatCurrency(bucket.net)}
                      </span>
                    </div>
                  ))}
                  {!cashflow?.buckets?.length && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No cashflow data.</p>
                  )}
                </div>
              </SharedTile>

              <SharedTile>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-50">Expense breakdown</h2>
                <div className="space-y-2">
                  {breakdown?.items?.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                  {!breakdown?.items?.length && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No expense data.</p>
                  )}
                </div>
              </SharedTile>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SharedTile>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-50">Performance by property</h2>
                <div className="space-y-2">
                  {propertySeries?.items?.map((item) => (
                    <div key={item.propertyId} className="flex items-center justify-between text-sm">
                      <span>{item.propertyLabel}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${formatCurrency(item.net)}
                      </span>
                    </div>
                  ))}
                  {!propertySeries?.items?.length && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No property performance data.</p>
                  )}
                </div>
              </SharedTile>

              <SharedTile>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-50">Upcoming</h2>
                <ul className="space-y-2 text-sm">
                  {upcoming?.items?.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="rounded border border-gray-100 px-3 py-2 dark:border-gray-800">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.label}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {item.propertyLabel ? `${item.propertyLabel} • ` : ""}
                        {item.dueOn}
                      </div>
                    </li>
                  ))}
                  {!upcoming?.items?.length && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events.</p>
                  )}
                </ul>
              </SharedTile>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No data for this range.
          </div>
        )}
      </section>
    </div>
  );
}
