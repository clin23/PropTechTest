import { test, expect } from '@playwright/test';

test('Property detail key dates tab shows only that property reminders', async ({ page }) => {
  await page.goto('/properties/1');
  await page.getByRole('tab', { name: 'Key Dates' }).click();
  const container = page.getByTestId('key-dates-list');
  await expect(container.getByText('Lease expires')).toBeVisible();
  await expect(container.getByText('Smoke alarm check')).toHaveCount(0);
});

test('User can add, edit, and delete a key date with task sync', async ({ page }) => {
  await page.goto('/properties/1');
  await page.getByRole('tab', { name: 'Key Dates' }).click();

  await page.getByRole('button', { name: '+ Add key date' }).click();
  const modal = page.getByTestId('key-date-modal');

  await modal.getByLabel('Key date name').fill('Smoke alarm service');
  await modal.getByLabel('Category').selectOption('custom');
  await modal.getByLabel('Due date').fill('2025-12-24');
  await modal.getByLabel('Time (optional)').fill('09:30');
  await modal.getByLabel('Recurrence / time set').fill('Annual');
  await modal.getByLabel('Priority').selectOption('high');

  await modal.getByRole('button', { name: '+ Add document' }).click();
  await modal.getByLabel('Name', { exact: true }).last().fill('Service certificate');
  await modal.getByLabel('Link (optional)').last().fill('https://example.com/service.pdf');

  await modal.getByRole('button', { name: '+ Add checklist item' }).click();
  await modal.locator('div').filter({ hasText: /^1\./ }).locator('input').fill('Book annual service');

  await modal.getByLabel('Add to tasks board').check();
  await modal.getByRole('button', { name: 'Save' }).click();
  await page.getByTestId('key-date-modal').waitFor({ state: 'detached' });

  const list = page.getByTestId('key-dates-list');
  await expect(list.getByText('Smoke alarm service')).toBeVisible();

  await list.getByText('Smoke alarm service').click();
  const editModal = page.getByTestId('key-date-modal');
  await editModal.getByLabel('Key date name').fill('Smoke alarm service (updated)');
  await editModal.getByLabel('Recurrence / time set').fill('Quarterly follow-up');
  const checklistInput = editModal.locator('div').filter({ hasText: /^1\./ }).locator('input');
  await checklistInput.fill('Confirm technician availability');
  await editModal.getByRole('button', { name: 'Save' }).click();
  await page.getByTestId('key-date-modal').waitFor({ state: 'detached' });

  await expect(list.getByText('Smoke alarm service (updated)')).toBeVisible();
  await expect(list.getByText('Recurs: Quarterly follow-up')).toBeVisible();

  await page.getByRole('tab', { name: 'Tasks' }).click();
  await expect(page.getByText('Smoke alarm service (updated)')).toBeVisible();
  await expect(page.getByText('Confirm technician availability')).toBeVisible();

  await page.getByRole('tab', { name: 'Key Dates' }).click();
  await list.getByText('Smoke alarm service (updated)').click();
  const deleteModal = page.getByTestId('key-date-modal');
  await deleteModal.getByRole('button', { name: 'Delete key date' }).click();
  const confirm = page
    .getByRole('dialog')
    .filter({ hasText: 'Type "delete" to confirm deleting this item.' });
  await confirm.getByRole('textbox').fill('delete');
  await confirm.getByRole('button', { name: 'Delete' }).click();
  await page.getByTestId('key-date-modal').waitFor({ state: 'detached' });

  await expect(list.getByText('Smoke alarm service (updated)')).toHaveCount(0);

  await page.getByRole('tab', { name: 'Tasks' }).click();
  await expect(page.getByText('Smoke alarm service (updated)')).toHaveCount(0);
  await expect(page.getByText('Confirm technician availability')).toHaveCount(0);
});

