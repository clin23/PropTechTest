import Skeleton from "../Skeleton";

export default function TasksSkeleton() {
  const columns = ["ASAP", "Soon", "Later", "Done"];

  return (
    <div className="p-6">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-4 overflow-x-auto p-1 pb-32">
          {columns.map((title) => (
            <div key={title} className="w-64 flex-shrink-0">
              <Skeleton className="h-6 w-32" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="rounded-lg border bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))}
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
          <div className="w-64 flex-shrink-0">
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="w-64 flex-shrink-0">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
