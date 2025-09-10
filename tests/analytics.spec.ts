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
});

test('breakdown endpoint responds', async ({ request }) => {
  const res = await request.get('/api/analytics/breakdown');
  const data = await res.json();
  expect(Array.isArray(data.items)).toBe(true);
});
