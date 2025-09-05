import { test, expect } from '@playwright/test';

test('Applications page has heading', async ({ page }) => {
  await page.goto('/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();
});
