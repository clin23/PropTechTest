export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

export const formatDate = (d?: string | Date) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
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
