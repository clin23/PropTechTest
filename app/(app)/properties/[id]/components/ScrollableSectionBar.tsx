"use client";

import { useMemo, useRef, type KeyboardEvent } from "react";

export interface SectionTab {
  id: string;
  label: string;
}

interface ScrollableSectionBarProps {
  tabs: SectionTab[];
  activeTab: string;
  onTabSelect: (tab: string) => void;
  className?: string;
}

export default function ScrollableSectionBar({
  tabs,
  activeTab,
  onTabSelect,
  className = "",
}: ScrollableSectionBarProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const orderedTabs = useMemo(() => tabs, [tabs]);

  const focusTab = (tabId: string) => {
    const el = tabRefs.current[tabId];
    el?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = orderedTabs[(index + 1) % orderedTabs.length];
      onTabSelect(next.id);
      focusTab(next.id);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev =
        orderedTabs[(index - 1 + orderedTabs.length) % orderedTabs.length];
      onTabSelect(prev.id);
      focusTab(prev.id);
    }
  };

  const rootClassName = ["flex w-full justify-center", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className="pointer-events-auto flex max-w-full justify-center">
        <div
          className="flex max-w-full flex-wrap justify-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-center shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-gray-700 dark:bg-gray-900/90"
          role="tablist"
          aria-label="Property sections"
          aria-orientation="horizontal"
        >
          {orderedTabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabSelect(tab.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-600 ${
                  isActive
                    ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                    : "border-transparent bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
