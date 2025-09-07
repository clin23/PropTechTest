import { test, expect } from '@playwright/test';

test('user can add and delete an income', async ({ page }) => {
  await page.goto('/finance/reports');

  await page.getByRole('button', { name: 'Add Income' }).click();
  await page.getByLabel('Date').fill('2024-01-15');
  await page.getByLabel('Category').selectOption('Base rent');
  await page.getByLabel('Amount').fill('2000');
  await page.getByLabel('Custom label').fill('January rent');
  await page.getByLabel('Notes').fill('January rent');
  await page.getByRole('button', { name: 'Save' }).click();

  const row = page.getByRole('row', { has: page.getByText('Base rent') });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('cell', { name: 'Base rent' })).toHaveCount(0);
});
