import { test, expect } from '@playwright/test';

test('Property CRM notes can be added', async ({ page }) => {
  await page.goto('/properties/1');
  await page.getByRole('button', { name: 'Tenant CRM' }).click();
  await page.getByPlaceholder('Add note').fill('Hello');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Hello')).toBeVisible();
});

