'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useWorkspaceDispatch, useWorkspaceState } from './state';

interface WorkspaceShellProps {
  header: ReactNode;
  filters: ReactNode;
  list: ReactNode;
  detail: ReactNode;
  bulkToolbar?: ReactNode;
}

export function WorkspaceShell({ header, filters, list, detail, bulkToolbar }: WorkspaceShellProps) {
  const listPercent = useWorkspaceState((state) => state.layout.listPercent);
  const isFiltersOpen = useWorkspaceState((state) => state.isFiltersOpen);
  const dispatch = useWorkspaceDispatch();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const startPercentRef = useRef(listPercent);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (event: PointerEvent) => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (!width) return;
      const delta = event.clientX - startXRef.current;
      const deltaPercent = (delta / width) * 100;
      dispatch({ type: 'set-layout', listPercent: startPercentRef.current + deltaPercent });
    };
    const stop = () => setIsDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dispatch, isDragging]);

  useEffect(() => {
    if (!isDragging) return;
    const preventSelection = (event: Event) => {
      event.preventDefault();
    };
    document.body.classList.add('select-none');
    document.addEventListener('selectstart', preventSelection);
    return () => {
      document.body.classList.remove('select-none');
      document.removeEventListener('selectstart', preventSelection);
    };
  }, [isDragging]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    startXRef.current = event.clientX;
    startPercentRef.current = listPercent;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handleKeyResize = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      dispatch({ type: 'set-layout', listPercent: listPercent - 2 });
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      dispatch({ type: 'set-layout', listPercent: listPercent + 2 });
    }
  };

  const closeFilters = () => dispatch({ type: 'set-filters-open', value: false });
  const openFilters = () => dispatch({ type: 'set-filters-open', value: true });

  const listWidthStyle = useMemo(() => ({ width: `${listPercent}%` }), [listPercent]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-surface/80 px-4 py-4 sm:px-6">{header}</header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="hidden w-[18.5rem] shrink-0 border-r border-border/60 bg-surface/60 p-4 md:block" aria-label="Tenant filters">
          {filters}
        </aside>
        <div className="flex min-h-0 flex-1 flex-col" ref={containerRef}>
          <div className="flex items-center justify-between border-b border-border/60 bg-surface/60 px-4 py-3 md:hidden">
            <h2 className="text-sm font-semibold">Workspace</h2>
            <button
              type="button"
              onClick={openFilters}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Filters
            </button>
          </div>
          {bulkToolbar}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <section
              className="flex min-h-0 flex-col border-r border-border/60 bg-surface/70"
              style={listWidthStyle}
              aria-label="Tenant directory"
            >
              {list}
            </section>
            <button
              type="button"
              aria-label="Resize tenant list"
              aria-valuenow={Math.round(listPercent)}
              aria-valuemin={24}
              aria-valuemax={60}
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyResize}
              className={`hidden w-1 cursor-col-resize touch-none items-stretch justify-center bg-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:flex ${
                isDragging ? 'bg-primary/40' : 'bg-border/60'
              }`}
            >
              <span aria-hidden="true" className="h-full w-px bg-border" />
            </button>
            <section className="min-h-0 flex-1 overflow-hidden bg-background" aria-label="Tenant details">
              {detail}
            </section>
          </div>
        </div>
      </div>
      {isFiltersOpen ? (
        <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-y-0 left-0 w-[92vw] max-w-sm overflow-y-auto border-r border-border/60 bg-surface p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-sm font-semibold">Filters</h2>
              <button
                type="button"
                onClick={closeFilters}
                className="rounded-lg border border-border/60 px-2 py-1 text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </div>
            {filters}
          </div>
        </div>
      ) : null}
    </div>
  );
}

