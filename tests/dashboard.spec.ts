import { test, expect } from '@playwright/test';

test('dashboard renders and quick actions work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('cashflow-tile')).toBeVisible();
  await expect(page.getByTestId('property-card').first()).toBeVisible();
  await expect(page.getByTestId('reminders')).toBeVisible();
  await expect(page.getByTestId('quick-actions')).toBeVisible();

  await page.getByRole('button', { name: 'Log Expense' }).click();
  await expect(page.getByPlaceholder('Amount')).toBeVisible();

  await page.getByRole('button', { name: 'Upload Document' }).click();
  await expect(page.getByLabel('Document')).toBeVisible();

  await page.getByRole('button', { name: 'Message Tenant' }).click();
  await expect(page.getByPlaceholder('Message to tenant')).toBeVisible();
});
