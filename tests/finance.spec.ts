import { test, expect } from '@playwright/test';

test('Finance page has heading', async ({ page }) => {
  await page.goto('/finance');
  await expect(page.getByRole('heading', { name: 'Finance' })).toBeVisible();
});
