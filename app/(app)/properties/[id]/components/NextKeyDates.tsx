"use client";

import { useCallback, type KeyboardEventHandler } from "react";

import type { PropertyEvent } from "../../../../../types/property";
import type { PropertyTabId } from "../tabs";
import { sortPropertyEvents } from "../lib/sortEvents";

interface NextKeyDatesProps {
  events: PropertyEvent[];
  onNavigate: (tabId: PropertyTabId) => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const severityStyles: Record<"high" | "med" | "low", string> = {
  high: "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-500/10",
  med: "border-yellow-500 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-500/10",
  low: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-500/10",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return dateFormatter.format(parsed);
}

export default function NextKeyDates({ events, onNavigate }: NextKeyDatesProps) {
  const sortedEvents = sortPropertyEvents(events);

  if (!sortedEvents.length) {
    return null;
  }

  const handleNavigate = useCallback(() => onNavigate("key-dates"), [onNavigate]);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        handleNavigate();
      }
    },
    [handleNavigate],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="group flex w-full flex-col gap-2.5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-gray-600 dark:hover:bg-gray-800/70 dark:focus-visible:ring-offset-gray-900"
      aria-label="View next key dates"
    >
      <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100">
        <span>Next Key Dates</span>
        <span className="text-xs font-medium text-blue-600 group-hover:underline">View key dates</span>
      </div>
      <div className="-mx-1 overflow-x-auto pb-1">
        <ol className="mx-1 flex min-w-full gap-2.5">
          {sortedEvents.map((event) => {
            const severityClass = event.severity ? severityStyles[event.severity] : severityStyles.low;
            return (
              <li key={`${event.title}-${event.date}`} className="min-w-[180px] flex-1">
                <div
                  className={`h-full rounded-md border-l-4 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition dark:text-gray-100 ${severityClass}`}
                >
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{formatDate(event.date)}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
