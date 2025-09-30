import { test, expect } from '@playwright/test';

test('Tenant CRM notes can be added from the Tenants workspace', async ({ page }) => {
  await page.goto('/tenants');
  await page.getByLabel('Add a note').fill('Hello');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByText('Hello')).toBeVisible();
});

