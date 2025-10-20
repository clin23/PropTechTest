'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

import type { TenantStage, TenantTag } from '../../../../lib/tenants/types';

type ArrearsTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkspaceFilters {
  search: string;
  stages: TenantStage[];
  healthRange: [number, number];
  arrearsTiers: ArrearsTier[];
  lastContactWithinDays: number | null;
  inspectionWindowDays: number | null;
  watchlistOnly: boolean;
  tags: TenantTag[];
  customTags: string[];
  showArrearsOnly: boolean;
}

export interface WorkspaceState {
  filters: WorkspaceFilters;
  selectedTenantId?: string;
  selection: string[];
  layout: {
    listPercent: number;
  };
  recentSearches: string[];
  isFiltersOpen: boolean;
  savedViewId?: string;
}

type WorkspaceAction =
  | { type: 'set-filter'; key: keyof WorkspaceFilters; value: WorkspaceFilters[keyof WorkspaceFilters] }
  | { type: 'toggle-stage'; stage: TenantStage }
  | { type: 'set-filters'; value: WorkspaceFilters; savedViewId?: string }
  | { type: 'set-selection'; ids: string[] }
  | { type: 'toggle-select'; id: string }
  | { type: 'clear-selection' }
  | { type: 'set-selected-tenant'; tenantId?: string }
  | { type: 'record-search'; value: string }
  | { type: 'set-layout'; listPercent: number }
  | { type: 'set-filters-open'; value: boolean }
  | { type: 'set-saved-view'; savedViewId?: string };

const STORAGE_KEY = 'tenant-workspace:v1';

const defaultFilters: WorkspaceFilters = {
  search: '',
  stages: [],
  healthRange: [0, 100],
  arrearsTiers: [],
  lastContactWithinDays: null,
  inspectionWindowDays: null,
  watchlistOnly: false,
  tags: [],
  customTags: [],
  showArrearsOnly: false,
};

const defaultState: WorkspaceState = {
  filters: defaultFilters,
  selectedTenantId: undefined,
  selection: [],
  layout: { listPercent: 36 },
  recentSearches: [],
  isFiltersOpen: false,
  savedViewId: undefined,
};

const WorkspaceContext = createContext<{
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
} | null>(null);

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'set-filter': {
      const nextFilters = { ...state.filters, [action.key]: action.value } as WorkspaceFilters;
      return {
        ...state,
        filters: nextFilters,
        savedViewId: undefined,
      };
    }
    case 'toggle-stage': {
      const stages = state.filters.stages.includes(action.stage)
        ? state.filters.stages.filter((stage) => stage !== action.stage)
        : [...state.filters.stages, action.stage];
      return {
        ...state,
        filters: { ...state.filters, stages },
        savedViewId: undefined,
      };
    }
    case 'set-filters': {
      return {
        ...state,
        filters: action.value,
        savedViewId: action.savedViewId,
      };
    }
    case 'set-selection': {
      const unique = Array.from(new Set(action.ids));
      return {
        ...state,
        selection: unique,
      };
    }
    case 'toggle-select': {
      const set = new Set(state.selection);
      if (set.has(action.id)) {
        set.delete(action.id);
      } else {
        set.add(action.id);
      }
      return {
        ...state,
        selection: Array.from(set),
      };
    }
    case 'clear-selection': {
      return {
        ...state,
        selection: [],
      };
    }
    case 'set-selected-tenant': {
      return {
        ...state,
        selectedTenantId: action.tenantId,
      };
    }
    case 'record-search': {
      const trimmed = action.value.trim();
      if (!trimmed) return state;
      const next = [trimmed, ...state.recentSearches.filter((item) => item !== trimmed)].slice(0, 8);
      return {
        ...state,
        recentSearches: next,
      };
    }
    case 'set-layout': {
      const width = Math.min(60, Math.max(24, action.listPercent));
      return {
        ...state,
        layout: { listPercent: width },
      };
    }
    case 'set-filters-open': {
      return {
        ...state,
        isFiltersOpen: action.value,
      };
    }
    case 'set-saved-view': {
      return {
        ...state,
        savedViewId: action.savedViewId,
      };
    }
    default:
      return state;
  }
}

function loadInitialState(): WorkspaceState {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    if (!parsed || typeof parsed !== 'object') return defaultState;
    return {
      ...defaultState,
      ...parsed,
      filters: { ...defaultFilters, ...parsed.filters },
      selection: Array.isArray(parsed.selection) ? parsed.selection : [],
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
      layout: parsed.layout ? { listPercent: parsed.layout.listPercent ?? defaultState.layout.listPercent } : defaultState.layout,
    };
  } catch (error) {
    console.error('Failed to load workspace state', error);
    return defaultState;
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, loadInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return ctx;
}

export function useWorkspaceState<T>(selector: (state: WorkspaceState) => T): T {
  const { state } = useWorkspaceContext();
  return selector(state);
}

export function useWorkspaceDispatch() {
  const { dispatch } = useWorkspaceContext();
  return dispatch;
}

export function buildTenantListParams(filters: WorkspaceFilters) {
  return {
    q: filters.search,
    tags: filters.tags,
    arrearsOnly: filters.showArrearsOnly,
    stages: filters.stages,
    health: { min: filters.healthRange[0], max: filters.healthRange[1] },
    arrearsTiers: filters.arrearsTiers,
    lastContactWithinDays: filters.lastContactWithinDays,
    inspectionWindowDays: filters.inspectionWindowDays,
    watchlistOnly: filters.watchlistOnly,
    customTags: filters.customTags,
  } as const;
}

