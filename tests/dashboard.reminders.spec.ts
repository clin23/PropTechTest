import { test, expect } from '@playwright/test';

test('Dashboard shows reminders with property badges and view all link', async ({ page }) => {
  await page.goto('/dashboard');
  const container = page.getByTestId('reminders');
  await expect(container).toBeVisible();
  await expect(container.getByText('123 Main St')).toBeVisible();
  await expect(container.getByText('10 Rose St')).toHaveCount(0);
  await page.getByRole('link', { name: 'View all' }).click();
  await expect(page).toHaveURL('/reminders');
});

