import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnalyticsState, AnalyticsStateType } from './schemas';

function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

function parse(params: URLSearchParams): AnalyticsStateType {
  const obj: any = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  // filters can be JSON encoded
  if (obj.filters) {
    try {
      obj.filters = JSON.parse(obj.filters);
    } catch {
      obj.filters = {};
    }
  }
  const defaults = defaultRange();
  try {
    return AnalyticsState.parse({ ...defaults, ...obj });
  } catch {
    return AnalyticsState.parse(defaults);
  }
}

function serialize(state: AnalyticsStateType): URLSearchParams {
  const params = new URLSearchParams();
  params.set('viz', state.viz);
  params.set('metric', state.metric);
  params.set('groupBy', state.groupBy);
  params.set('granularity', state.granularity);
  params.set('from', state.from);
  params.set('to', state.to);
  params.set('filters', JSON.stringify(state.filters));
  return params;
}

/**
 * Syncs analytics state with the URL query string.
 */
export function useUrlState(state: AnalyticsStateType, onChange: (s: AnalyticsStateType) => void) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    // Parse initial
    const parsed = parse(search as any as URLSearchParams);
    onChange(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = serialize(state);
    const url = `${pathname}?${params.toString()}`;
    const t = setTimeout(() => {
      router.replace(url);
    }, 300);
    return () => clearTimeout(t);
  }, [state, router, pathname]);
}

export const urlState = { parse, serialize };
