import { test, expect } from '@playwright/test';

test('property pnl summary endpoint supports date range', async ({ request }) => {
  const res = await request.get('/api/properties/1/summary/pnl?from=2024-01-01&to=2024-03-31');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.income).toBe(1250);
  expect(json.expenses).toBe(1650);
  expect(json.net).toBe(-400);
  expect(json.buckets).toEqual([
    { month: '2024-01', income: 1250, expenses: 1000, net: 250 },
    { month: '2024-02', income: 0, expenses: 500, net: -500 },
    { month: '2024-03', income: 0, expenses: 150, net: -150 },
  ]);
});
