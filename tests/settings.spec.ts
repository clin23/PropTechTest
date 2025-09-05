import { test, expect } from '@playwright/test';

test('Settings page has heading', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});
