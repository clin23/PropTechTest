"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../../../../../components/ui/button";

export interface SectionTab {
  id: string;
  label: string;
}

interface ScrollableSectionBarProps {
  tabs: SectionTab[];
  activeTab: string;
  onTabSelect: (tab: string) => void;
}

export default function ScrollableSectionBar({
  tabs,
  activeTab,
  onTabSelect,
}: ScrollableSectionBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const orderedTabs = useMemo(() => tabs, [tabs]);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedTabs.length]);

  useEffect(() => {
    updateScrollButtons();
  }, [activeTab]);

  useEffect(() => {
    const current = tabRefs.current[activeTab];
    const container = scrollContainerRef.current;
    if (current && container) {
      const currentRect = current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (currentRect.left < containerRect.left || currentRect.right > containerRect.right) {
        current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [activeTab]);

  const handleArrowClick = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = direction === "left" ? -240 : 240;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

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

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        aria-label="Scroll left"
        onClick={() => handleArrowClick("left")}
        disabled={!canScrollLeft}
        className="h-9 w-9 p-0"
      >
        <span aria-hidden>&lsaquo;</span>
      </Button>
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto whitespace-nowrap"
          role="tablist"
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
                className={`relative mx-1 flex-shrink-0 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        aria-label="Scroll right"
        onClick={() => handleArrowClick("right")}
        disabled={!canScrollRight}
        className="h-9 w-9 p-0"
      >
        <span aria-hidden>&rsaquo;</span>
      </Button>
    </div>
  );
}
