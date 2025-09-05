import { test, expect } from '@playwright/test';

test('Vendors page has heading', async ({ page }) => {
  await page.goto('/vendors');
  await expect(page.getByRole('heading', { name: 'Vendors' })).toBeVisible();
});
