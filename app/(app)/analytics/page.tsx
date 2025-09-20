'use client';

import Link from 'next/link';
import { useState } from 'react';

// Landing page for the analytics section. Provides quick links to the
// overview, custom analytics and builder areas, along with a placeholder for
// the planned AI-powered search feature.
export default function AnalyticsPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid flex-1 gap-4 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(0,1fr))]">
        <div
          className="relative flex h-full flex-col gap-6 overflow-hidden rounded-lg border bg-cover bg-center bg-no-repeat p-6 shadow-lg backdrop-blur md:col-span-2 md:row-span-2"
          style={{ backgroundImage: "url('/analytics-overview-bg.svg')" }}
        >
          <span
            className="pointer-events-none absolute inset-0 z-0 bg-white/70 dark:bg-gray-900/60"
            aria-hidden="true"
          />
          <Link
            href="/analytics/overview"
            className="absolute inset-0 z-10"
            aria-label="Go to overview"
          />
          <div className="pointer-events-none relative z-20">
            <span className="text-4xl font-bold md:text-5xl">Overview</span>
          </div>
          <div
            className="relative z-20 mt-auto"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What do you want to see?"
              className="w-full p-2 border rounded bg-white/70 dark:bg-gray-800/70 text-sm"
            />
            {query && (
              <div className="mt-2 text-sm">
                Showing results for: <strong>{query}</strong>
              </div>
            )}
          </div>
        </div>
        <Link
          href="/analytics/custom"
          className="flex items-center justify-center rounded-lg border bg-white/10 p-6 text-2xl font-semibold shadow-lg backdrop-blur dark:bg-gray-900/20 md:col-start-3 md:row-start-1 md:h-full md:text-3xl"
        >
          My Custom Analytics
        </Link>
        <Link
          href="/analytics/builder"
          className="flex items-center justify-center rounded-lg border bg-white/10 p-6 text-2xl font-semibold shadow-lg backdrop-blur dark:bg-gray-900/20 md:col-start-3 md:row-start-2 md:h-full md:text-3xl"
        >
          Analytics Builder
        </Link>
      </div>
    </div>
  );
}

