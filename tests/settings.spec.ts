import { test, expect } from '@playwright/test';

test('Settings page has heading', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('can toggle dark mode', async ({ page }) => {
  await page.goto('/settings');
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/dark/);
  await page.getByLabel('Dark Mode').check();
  await expect(html).toHaveClass(/dark/);
});
