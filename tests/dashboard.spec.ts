import { test, expect } from '@playwright/test';

test('dashboard shows P&L chart and property tags', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('P&L Trend')).toBeVisible();
  await expect(page.getByTestId('reminders').getByText('123 Main St')).toBeVisible();
  await expect(page.getByText('10 Rose St')).toHaveCount(0);
});
