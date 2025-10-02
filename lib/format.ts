export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

const getOrdinalDay = (day: number) => {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

export const formatDate = (d?: string | Date) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';

  const weekday = new Intl.DateTimeFormat('en-AU', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-AU', { month: 'long' }).format(date);
  const year = date.getFullYear();
  const day = getOrdinalDay(date.getDate());

  return `${weekday} | ${day} ${month} ${year}`;
};

export const formatChartDate = (d?: string | Date) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const formatted = new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(date);
  return `${formatted}'`;
};

export const formatMoney = (cents: number) => formatCurrency(cents / 100);

const shortDateFromParts = (year: number, month: number, day: number) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(day)}/${pad(month)}/${year.toString().slice(-2)}`;
};

const ISO_LIKE_DATE = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/;

export const formatShortDate = (input?: string | Date | null) => {
  if (!input) return '—';

  const formatDate = (date: Date) =>
    shortDateFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? '—' : formatDate(input);
  }

  const value = String(input).trim();
  if (!value) return '—';

  const isoMatch = value.match(ISO_LIKE_DATE);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return shortDateFromParts(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      Number.parseInt(day, 10)
    );
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return formatDate(date);
};

export const statusToBadgeColor = (status: string) => {
  switch (status) {
    case 'Overdue':
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'Due':
    case 'med':
      return 'bg-orange-100 text-orange-800';
    case 'Upcoming':
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    case 'Paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
