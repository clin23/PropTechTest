'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ANALYTICS_OVERVIEW_BACKGROUND } from './overview-background';
import { ANALYTICS_BUILDER_BACKGROUND } from './builder-background';

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
          className="group relative flex h-full flex-col gap-6 overflow-hidden rounded-lg border bg-cover bg-center bg-no-repeat p-6 shadow-lg transition-shadow duration-300 ease-out hover:shadow-2xl focus-within:shadow-2xl backdrop-blur md:col-span-2 md:row-span-2"
          style={{ backgroundImage: `url(${ANALYTICS_OVERVIEW_BACKGROUND})` }}
        >
          <span
            className="pointer-events-none absolute inset-0 z-0 bg-white opacity-70 transition-opacity duration-300 ease-in-out dark:bg-gray-900 dark:opacity-60 group-hover:opacity-40 group-focus-within:opacity-40 dark:group-hover:opacity-30 dark:group-focus-within:opacity-30"
            aria-hidden="true"
          />
          <Link
            href="/analytics/overview"
            className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-white/40"
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
          className="flex items-center justify-center rounded-lg border bg-white/10 p-6 text-2xl font-semibold shadow-lg transition-shadow duration-300 ease-out hover:shadow-2xl focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:bg-gray-900/20 dark:focus-visible:ring-white/40 md:col-start-3 md:row-start-1 md:h-full md:text-3xl"
        >
          <span
            className="pointer-events-none absolute inset-0 z-0 bg-white opacity-70 transition-opacity duration-300 dark:bg-gray-900 dark:opacity-60 group-hover:opacity-30 group-focus-within:opacity-30 dark:group-hover:opacity-20 dark:group-focus-within:opacity-20"
            aria-hidden="true"
          />
          <Link
            href="/analytics/custom"
            className="absolute inset-0 z-10 focus-visible:outline-none"
            aria-label="Go to custom analytics"
          />
          <div className="pointer-events-none relative z-20 flex flex-1 flex-col justify-between">
            <span className="text-3xl font-semibold md:text-4xl">My Custom Analytics</span>
          </div>
        </div>
        <Link
          href="/analytics/builder"
          className="group relative flex h-full flex-col justify-center gap-4 overflow-hidden rounded-lg border bg-cover bg-center bg-no-repeat p-6 text-2xl font-semibold shadow-lg transition-shadow duration-300 ease-out hover:shadow-2xl focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent backdrop-blur dark:focus-visible:ring-white/40 md:col-start-3 md:row-start-2 md:h-full md:text-3xl"
          style={{ backgroundImage: `url(${ANALYTICS_BUILDER_BACKGROUND})` }}
        >
          <span
            className="pointer-events-none absolute inset-0 z-0 bg-white opacity-70 transition-opacity duration-300 ease-in-out dark:bg-gray-900 dark:opacity-60 group-hover:opacity-40 group-focus-visible:opacity-40 dark:group-hover:opacity-30 dark:group-focus-visible:opacity-30"
            aria-hidden="true"
          />
          <span className="relative z-10">Analytics Builder</span>
        </Link>
      </div>
    </div>
  );
}

