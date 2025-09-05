import { test, expect } from '@playwright/test';

// Ensure expenses can be added, appear in the list, and exported
test('expenses can be added, listed, and exported', async ({ page }) => {
  await page.goto('/finance/expenses');

  await page.getByRole('button', { name: 'Add Expense' }).click();
  await page.getByLabel('Date').fill('2024-01-01');
  await page.getByLabel('Category').fill('Utilities');
  await page.getByLabel('Vendor').fill('Acme Corp');
  await page.getByLabel('Amount').fill('100');
  await page.getByLabel('GST').fill('10');
  await page.getByLabel('Notes').fill('Test expense');
  await page.getByRole('button', { name: 'Save' }).click();

  const row = page.getByRole('row', { has: page.getByText('Acme Corp') });
  await expect(row).toBeVisible();

  await page.goto('/finance/reports');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export CSV' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('expenses.csv');
});
