import { test, expect } from '@playwright/test';

test('Rent Review tab is available on property page', async ({ page }) => {
  await page.goto('/properties/1');
  await page.getByRole('button', { name: 'Rent Review' }).click();
  await expect(page.getByRole('heading', { name: 'Rent Review' })).toBeVisible();
});
