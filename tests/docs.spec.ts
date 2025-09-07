import { test, expect } from '@playwright/test';
const samplePngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const samplePng = {
  name: 'sample.png',
  mimeType: 'image/png',
  buffer: Buffer.from(samplePngBase64, 'base64'),
};

test('Documents hub search, filter and upload', async ({ page }) => {
  await page.goto('/documents');
  await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible();

  // search
  await page.getByPlaceholder('Search documents').fill('lease');
  await expect(page.getByText('lease.pdf')).toBeVisible();
  await expect(page.getByText('invoice.pdf')).not.toBeVisible();

  // filter by property
  await page.getByPlaceholder('Search documents').fill('');
  await page.getByLabel('Property filter').selectOption('456 Oak Ave');
  await expect(page.getByText('inspection.pdf')).toBeVisible();
  await expect(page.getByText('lease.pdf')).not.toBeVisible();

  // upload
  await page.getByLabel('Property filter').selectOption('');
  await page.setInputFiles('[data-testid="doc-upload"]', samplePng);
  await expect(page.getByText('sample.png')).toBeVisible();
});
