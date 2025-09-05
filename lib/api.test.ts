import { api, uploadExpenseReceipt } from './api';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// JSON requests should include application/json Content-Type by default

test('api uses JSON Content-Type when body is JSON', async () => {
  (globalThis as any).fetch = async (_input: RequestInfo, init?: RequestInit) => {
    const headers = init?.headers as any;
    if (headers instanceof Headers) {
      assert.equal(headers.get('Content-Type'), 'application/json');
    } else {
      assert.equal(headers['Content-Type'], 'application/json');
    }
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  await api('/test', { method: 'POST', body: JSON.stringify({ ok: true }) });
});

// Multipart requests should omit the Content-Type header so the browser can set it

test('api omits Content-Type for FormData uploads', async () => {
  (globalThis as any).fetch = async (_input: RequestInfo, init?: RequestInit) => {
    const headers = init?.headers as any;
    if (headers instanceof Headers) {
      assert.ok(!headers.has('Content-Type'));
    } else {
      assert.ok(!('Content-Type' in headers));
    }
    assert.ok(init?.body instanceof FormData);
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const file = new File(['hello'], 'receipt.txt', { type: 'text/plain' });
  await uploadExpenseReceipt('p1', 'e1', file);
});
