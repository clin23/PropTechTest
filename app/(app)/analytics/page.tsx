'use client';

import Link from 'next/link';
import { useState } from 'react';

// Landing page for the analytics section. Provides quick links to the
// overview, custom analytics and builder areas, along with a placeholder for
// the planned AI-powered search feature.
export default function AnalyticsPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
      <div className="grid grid-cols-3 grid-rows-[auto_auto] gap-4">
        <div className="relative col-span-2 row-span-2 flex flex-col border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg p-4">
          <Link
            href="/analytics/overview"
            className="absolute inset-0"
            aria-label="Go to overview"
          />
          <div className="relative z-10 pointer-events-none">
            <span className="text-4xl font-bold md:text-5xl">Overview</span>
          </div>
          <div
            className="mt-4 relative z-10"
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
          className="col-start-3 row-start-1 flex items-center justify-center border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg text-2xl font-bold md:text-3xl"
        >
          My Custom Analytics
        </Link>
        <Link
          href="/analytics/builder"
          className="col-start-3 row-start-2 flex items-center justify-center border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur shadow-lg text-2xl font-bold md:text-3xl"
        >
          Analytics Builder
        </Link>
      </div>
    </div>
  );
}

