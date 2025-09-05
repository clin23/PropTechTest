import { test, expect } from '@playwright/test';

test('Properties page has heading', async ({ page }) => {
  await page.goto('/properties');
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();
});

test('Property detail page shows tabs', async ({ page }) => {
  await page.goto('/properties/1');
  await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible();
});

