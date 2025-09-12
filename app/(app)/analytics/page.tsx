import Link from 'next/link';

export default function AnalyticsHome() {
  return (
    <div className="p-6 h-full">
      <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full">
        <Link
          href="/analytics/overview"
          className="col-span-2 row-span-2 flex items-center justify-center border rounded bg-gray-100 dark:bg-gray-800">
          Overview
        </Link>
        <Link
          href="/analytics/custom"
          className="col-start-3 row-start-1 flex items-center justify-center border rounded bg-gray-100 dark:bg-gray-800">
          Custom Analytics
        </Link>
        <Link
          href="/analytics/builder"
          className="col-start-3 row-start-2 flex items-center justify-center border rounded bg-gray-100 dark:bg-gray-800">
          Analytics Builder
        </Link>
      </div>
    </div>
  );
}
