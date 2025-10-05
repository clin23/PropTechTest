'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { TenantSummary } from '../../../../lib/tenants/types';
import { TenantCard, TenantCardSkeleton } from './TenantCard';

interface TenantListVirtualProps {
  tenants: TenantSummary[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (tenant: TenantSummary) => void;
  onOpen?: (tenant: TenantSummary) => void;
}

const ROW_HEIGHT = 96;

export function TenantListVirtual({ tenants, isLoading, selectedId, onSelect, onOpen }: TenantListVirtualProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState(400);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const handleScroll = () => setScrollTop(element.scrollTop);
    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          const height = entry.contentRect.height;
          setViewportHeight(Math.max(200, height));
        }
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { startIndex, endIndex } = useMemo(() => {
    const total = tenants.length;
    if (total === 0) {
      return { startIndex: 0, endIndex: 0 };
    }
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT);
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 4);
    const end = Math.min(total, start + visibleCount + 8);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, viewportHeight, tenants.length]);

  const handleSelect = useCallback(
    (tenant: TenantSummary) => {
      onSelect?.(tenant);
    },
    [onSelect]
  );

  const handleOpen = useCallback(
    (tenant: TenantSummary) => {
      onOpen?.(tenant);
    },
    [onOpen]
  );

  const rendered = tenants.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;
  const totalHeight = tenants.length * ROW_HEIGHT;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <TenantCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto pr-1">
      {tenants.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }} className="space-y-2">
            {rendered.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                selected={tenant.id === selectedId}
                onSelect={handleSelect}
                onOpen={handleOpen}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 p-8 text-center text-sm text-muted-foreground">
      <p className="text-base font-semibold text-foreground">No tenants match your filters</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try adjusting your search, or clear your segment filters to view the full directory.
      </p>
    </div>
  );
}
