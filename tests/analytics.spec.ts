import { test, expect } from '@playwright/test';

test('analytics page loads and KPIs render', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page.getByTestId('kpi-net')).toBeVisible();
  await expect(page.getByTestId('kpi-collection')).toBeVisible();
});

test('pnl series provides multiple points', async ({ request }) => {
  const res = await request.get('/api/analytics/pnl');
  const data = await res.json();
  expect(data.series.length).toBeGreaterThan(3);
});

test('expense breakdown has categories', async ({ request }) => {
  const res = await request.get('/api/analytics/expenses');
  const data = await res.json();
  expect(data.slices.length).toBeGreaterThanOrEqual(3);
});

test('export csv endpoints respond', async ({ request }) => {
  for (const path of ['/api/analytics/export/pnl.csv', '/api/analytics/export/expenses.csv', '/api/analytics/export/rent.csv']) {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(10);
  }
});
