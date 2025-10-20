import type { ExpenseByCategorySlice } from '../../types/dashboard';

const CATEGORY_KEYWORDS: { category: ExpenseByCategorySlice['category']; keywords: RegExp[] }[] = [
  {
    category: 'Insurance',
    keywords: [/insurance/],
  },
  {
    category: 'Rates',
    keywords: [/rate/, /council/],
  },
  {
    category: 'Utilities',
    keywords: [/utility/, /water/, /electric/, /gas/, /power/],
  },
  {
    category: 'Maintenance',
    keywords: [
      /maint/,
      /repair/,
      /plumb/,
      /electrical/,
      /garden/,
      /landscap/,
      /clean/,
      /hvac/,
      /paint/,
      /pest/,
      /appliance/,
    ],
  },
  {
    category: 'Strata',
    keywords: [/strata/],
  },
  {
    category: 'Mortgage Interest',
    keywords: [/mortgage/, /interest/],
  },
  {
    category: 'Property Mgmt',
    keywords: [/manag/, /letting fee/, /property fee/],
  },
];

export function mapExpenseCategory(value: string | null | undefined): ExpenseByCategorySlice['category'] {
  const lower = (value ?? '').trim().toLowerCase();
  if (!lower) return 'Other';

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((pattern) => pattern.test(lower))) {
      return category;
    }
  }

  return 'Other';
}
