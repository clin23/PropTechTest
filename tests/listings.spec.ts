import { test, expect } from '@playwright/test';

test('Listings page has heading', async ({ page }) => {
  await page.goto('/listings');
  await expect(page.getByRole('heading', { name: 'Listings' })).toBeVisible();
});
