export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('en-AU').format(new Date(d));
