import { test, expect } from '@playwright/test';

test('Rent Review page has heading', async ({ page }) => {
  await page.goto('/rent-review');
  await expect(page.getByRole('heading', { name: 'Rent Reviews' })).toBeVisible();
});
