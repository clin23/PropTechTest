import { test, expect } from '@playwright/test';

test('user can add and delete an expense', async ({ page }) => {
  // Navigate to the expenses page
  await page.goto('/finance/expenses');

  // Add a new expense via the form
  await page.getByRole('button', { name: 'Add Expense' }).click();
  await page.getByLabel('Date').fill('2024-01-01');
  await page.getByLabel('Category').selectOption('General repairs');
  await page.getByLabel('Vendor').fill('Acme Corp');
  await page.getByLabel('Amount').fill('100');
  await page.getByLabel('GST').fill('10');
  await page.getByLabel('Notes').fill('Test expense');
  await page.getByRole('button', { name: 'Save' }).click();

  // Ensure the expense appears in the table
  const row = page.getByRole('row', { has: page.getByText('Acme Corp') });
  await expect(row).toBeVisible();

  // Delete the expense
  await row.getByRole('button', { name: 'Delete expense' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();

  // Verify the expense no longer appears
  await expect(page.getByRole('cell', { name: 'Acme Corp' })).toHaveCount(0);
});
