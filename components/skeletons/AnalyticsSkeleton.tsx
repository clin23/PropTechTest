import Skeleton from "../Skeleton";

export default function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(0,1fr))]">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-white/70 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 md:col-span-2 md:row-span-2">
          <Skeleton className="h-10 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-auto space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
