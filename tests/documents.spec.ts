import { test, expect } from '@playwright/test';
import path from 'path';

const uploadPath = path.resolve('tests/fixtures/upload.pdf');

test('Documents hub search, filter and upload', async ({ page }) => {
  await page.goto('/documents');
  await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible();

  // search
  await page.getByPlaceholder('Search documents').fill('lease');
  await expect(page.getByText('lease.pdf')).toBeVisible();
  await expect(page.getByText('insurance.pdf')).not.toBeVisible();

  // filter by property
  await page.getByPlaceholder('Search documents').fill('');
  await page.getByLabel('Property filter').selectOption('456 Oak Ave');
  await expect(page.getByText('insurance.pdf')).toBeVisible();
  await expect(page.getByText('lease.pdf')).not.toBeVisible();

  // upload
  await page.getByLabel('Property filter').selectOption('');
  await page.setInputFiles('[data-testid="doc-upload"]', uploadPath);
  await expect(page.getByText('upload.pdf')).toBeVisible();
});
