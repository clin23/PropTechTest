import { test, expect } from '@playwright/test';

test('Property detail key dates tab shows only that property reminders', async ({ page }) => {
  await page.goto('/properties/1');
  await page.getByRole('tab', { name: 'Key Dates' }).click();
  const container = page.getByTestId('reminders');
  await expect(container.getByText('123 Main St')).toBeVisible();
  await expect(container.getByText('456 Oak Ave')).toHaveCount(0);
});

