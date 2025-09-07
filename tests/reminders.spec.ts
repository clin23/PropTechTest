import { test, expect } from '@playwright/test';

const propertyId = 'property1';

test('reminders display and clear after rent payment', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Lease expiring soon')).toBeVisible();
  await expect(page.getByText('Rent review due')).toBeVisible();
  await expect(page.getByText('Insurance renewal')).toBeVisible();
  await expect(page.getByText('Rent is late')).toBeVisible();

  await page.request.post(`/api/properties/${propertyId}/income`, {
    data: { amount: 100, category: 'Base rent', date: '2024-01-01' },
  });

  await page.reload();
  await expect(page.locator('text=Rent is late')).toHaveCount(0);
});
