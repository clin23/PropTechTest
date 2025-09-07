import { test, expect } from '@playwright/test';

// Ensure expenses can be added and filtered
test('expenses can be added and filtered', async ({ page }) => {
  await page.goto('/finance/expenses');

  await page.getByRole('button', { name: 'Add Expense' }).click();
  await page.getByLabel('Date').fill('2024-01-01');
  await page.getByLabel('Category').fill('Utilities');
  await page.getByLabel('Vendor').fill('Acme Corp');
  await page.getByLabel('Amount').fill('100');
  await page.getByLabel('GST').fill('10');
  await page.getByLabel('Notes').fill('Test expense');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByPlaceholder('Vendor').fill('Acme');
  const row = page.getByRole('row', { has: page.getByText('Acme Corp') });
  await expect(row).toBeVisible();
});
