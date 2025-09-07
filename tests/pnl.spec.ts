import { test, expect } from '@playwright/test';

test('pnl tiles, chart and export', async ({ page }) => {
  await page.goto('/finance/pnl');
  await expect(page.getByText('Income')).toBeVisible();
  await expect(page.getByText('Expenses')).toBeVisible();
  await expect(page.locator('.recharts-wrapper')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export P&L CSV' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('pnl.csv');
});

test('pnl summary endpoint', async ({ request }) => {
  const res = await request.get('/api/pnl/summary?period=last6m');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.series).toHaveLength(6);
});
