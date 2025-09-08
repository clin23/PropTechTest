import { test, expect } from '@playwright/test';
import { resetStore } from '../app/api/store';

test.beforeEach(() => {
  resetStore();
});

test('property can be created, updated and deleted', async ({ request }) => {
  const createRes = await request.post('/api/properties', {
    data: {
      address: '789 Pine Rd',
      tenant: 'New Tenant',
      leaseStart: '2024-01-01',
      leaseEnd: '2024-12-31',
      rent: 1000,
      imageUrl: 'http://example.com/img.jpg',
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const created: any = await createRes.json();
  expect(created.address).toBe('789 Pine Rd');

  const updateRes = await request.patch(`/api/properties/${created.id}`, {
    data: { address: '789 Updated Rd', rent: 1100 },
  });
  expect(updateRes.ok()).toBeTruthy();
  const updated: any = await updateRes.json();
  expect(updated.address).toBe('789 Updated Rd');
  expect(updated.rent).toBe(1100);

  const deleteRes = await request.delete(`/api/properties/${created.id}`);
  expect(deleteRes.status()).toBe(204);

  const listRes = await request.get('/api/properties');
  const list: any[] = await listRes.json();
  expect(list.find((p) => p.id === created.id)).toBeUndefined();
});

