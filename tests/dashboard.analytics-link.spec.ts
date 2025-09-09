import { test, expect } from '@playwright/test';

test('clicking P&L chart navigates to analytics', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByTestId('pnl-mini').click();
  await expect(page).toHaveURL('/analytics');
});
