import { test, expect } from '@playwright/test';

test('Properties page has heading', async ({ page }) => {
  await page.goto('/properties');
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();
});

test('Property detail page shows tabs', async ({ page }) => {
  await page.goto('/properties/1');
  await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible();
  await page.getByRole('button', { name: 'Tenant CRM' }).click();
  await page.getByPlaceholder('Add note').fill('Hello');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Hello')).toBeVisible();
});

test('Hash opens Key Dates tab', async ({ page }) => {
  await page.goto('/properties/1#key-dates');
  await expect(page.getByText('Lease expires')).toBeVisible();
});

