import { test, expect } from '@playwright/test';

test('analytics page loads', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page.getByTestId('date-range-filter')).toBeVisible();
  await expect(page.getByTestId('viz-section')).toBeVisible();
});

test('series endpoint responds', async ({ request }) => {
  const res = await request.get('/api/analytics/series');
  const data = await res.json();
  expect(Array.isArray(data.buckets)).toBe(true);
  if (data.buckets.length > 0) {
    expect(data.buckets[0]).toHaveProperty('net');
    expect(data.buckets[0]).toHaveProperty('income');
    expect(data.buckets[0]).toHaveProperty('expenses');
  }
});

test('breakdown endpoint responds', async ({ request }) => {
  const res = await request.get('/api/analytics/breakdown');
  const data = await res.json();
  expect(Array.isArray(data.items)).toBe(true);
});

test('series income pulls from rent ledger', async ({ request }) => {
  const res = await request.get('/api/analytics/series?from=2025-03-01&to=2025-03-31');
  const data = await res.json();
  const march = data.buckets.find((b: any) => b.label === '2025-03');
  expect(march?.income).toBe(2200);
});
