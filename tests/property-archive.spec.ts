import { test, expect } from '@playwright/test';
import { resetStore } from '../app/api/store';

test.beforeEach(() => {
  resetStore();
});

test('property can be archived and unarchived', async ({ request }) => {
  let res = await request.post('/api/properties/2/archive');
  expect(res.status()).toBe(204);

  const list = await request.get('/api/properties');
  const data: any[] = await list.json();
  expect(data.find((p) => p.id === '2')).toBeUndefined();

  res = await request.post('/api/properties/2/unarchive');
  expect(res.status()).toBe(204);
  const list2 = await request.get('/api/properties');
  const data2: any[] = await list2.json();
  expect(data2.find((p) => p.id === '2')).toBeTruthy();
});
