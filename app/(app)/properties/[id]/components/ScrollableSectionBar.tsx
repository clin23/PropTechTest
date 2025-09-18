"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const syncScrollHints = (element: HTMLDivElement) => {
    const { scrollLeft, scrollWidth, clientWidth } = element;
    const maxScrollLeft = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < maxScrollLeft - 1);
  };

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const handleScroll = () => syncScrollHints(element);

    syncScrollHints(element);

    element.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [orderedTabs.length]);

  useEffect(() => {
    const element = scrollContainerRef.current;
    const activeButton = tabRefs.current[activeTab];

    if (!element || !activeButton) {
      return;
    }

    activeButton.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    requestAnimationFrame(() => {
      if (element) {
        syncScrollHints(element);
      }
    });
  }, [activeTab, orderedTabs.length]);

  const rootClassName = ["flex w-full justify-center", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className="pointer-events-auto relative w-full max-w-full">
        <div
          ref={scrollContainerRef}
          className="flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap rounded-full border border-gray-200 bg-white/90 px-3 py-2 text-center shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-gray-700 dark:bg-gray-900/90"
          role="tablist"
          aria-label="Property sections"
          aria-orientation="horizontal"
        >
          {orderedTabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            const tabClassName = [
              "flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-600",
              isActive
                ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                : "border-transparent bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
            ].join(" ");

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
                className={tabClassName}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-1 left-1 w-6 rounded-l-full bg-gradient-to-r from-white/90 via-white/60 to-transparent transition-opacity duration-200 supports-[backdrop-filter]:from-white/70 dark:from-gray-900/90 dark:via-gray-900/60 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-1 right-1 w-6 rounded-r-full bg-gradient-to-l from-white/90 via-white/60 to-transparent transition-opacity duration-200 supports-[backdrop-filter]:from-white/70 dark:from-gray-900/90 dark:via-gray-900/60 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
