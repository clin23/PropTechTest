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
