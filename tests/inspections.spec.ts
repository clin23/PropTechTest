import { test, expect } from '@playwright/test';

test('Inspections page has heading', async ({ page }) => {
  await page.goto('/inspections');
  await expect(page.getByRole('heading', { name: 'Inspections' })).toBeVisible();
});
