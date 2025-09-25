export type OverviewState = {
  from: string;
  to: string;
  propertyIds: string[];
  expenseCategory?: string | null;
};

export type OverviewQuery = Pick<OverviewState, 'from' | 'to' | 'propertyIds'>;

export const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA');

export function startOfFinancialYear(baseDate = new Date()): Date {
  const month = baseDate.getMonth();
  const year = baseDate.getFullYear();
  const fyStartMonth = 6; // July (0-indexed)
  const fyYear = month >= fyStartMonth ? year : year - 1;
  return new Date(fyYear, fyStartMonth, 1);
}

export function formatDate(date: Date): string {
  return DATE_FORMATTER.format(date);
}

export function defaultState(today = new Date()): OverviewState {
  const from = startOfFinancialYear(today);
  return {
    from: formatDate(from),
    to: formatDate(today),
    propertyIds: [],
  };
}

export function parseStateFromSearch(search: URLSearchParams, today = new Date()): OverviewState {
  const fallback = defaultState(today);
  const from = search.get('from') ?? fallback.from;
  const to = search.get('to') ?? fallback.to;
  const propertiesRaw = search.get('properties');
  const propertyIds = propertiesRaw
    ? propertiesRaw
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : fallback.propertyIds;
  const category = search.get('category');

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return fallback;
  }
  if (fromDate > toDate) {
    return {
      ...fallback,
      from: formatDate(toDate),
      to: formatDate(fromDate),
      propertyIds,
      expenseCategory: category ?? undefined,
    };
  }

  return {
    from: formatDate(fromDate),
    to: formatDate(toDate),
    propertyIds,
    expenseCategory: category ?? undefined,
  };
}

export function buildSearchParams(state: OverviewState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('from', state.from);
  params.set('to', state.to);
  if (state.propertyIds.length) {
    params.set('properties', state.propertyIds.join(','));
  }
  if (state.expenseCategory) {
    params.set('category', state.expenseCategory);
  }
  return params;
}

export function isSameState(a: OverviewState, b: OverviewState) {
  return (
    a.from === b.from &&
    a.to === b.to &&
    a.expenseCategory === b.expenseCategory &&
    a.propertyIds.length === b.propertyIds.length &&
    a.propertyIds.every((id, index) => id === b.propertyIds[index])
  );
}
