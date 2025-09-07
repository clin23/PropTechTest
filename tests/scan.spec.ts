import { test, expect } from '@playwright/test';
const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const file = {
  name: '2024-04-01-bunnings-repairs-50.png',
  mimeType: 'image/png',
  buffer: Buffer.from(sampleBase64, 'base64'),
};

test('scan receipt and apply to expense', async ({ page }) => {
  await page.goto('/finance/scan');
  await page.setInputFiles('input[type="file"]', file);
  await expect(page.getByText('Vendor: Bunnings')).toBeVisible();
  await page.getByRole('button', { name: 'Apply to Expense' }).click();
  await page.getByLabel('Property').selectOption('123 Main St');
  await page.getByLabel('Category').selectOption('General repairs');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.goto('/finance/expenses');
  await expect(page.getByText('Bunnings')).toBeVisible();
});
