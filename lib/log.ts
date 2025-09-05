export async function logEvent(name: string, payload?: Record<string, any>) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, payload }),
      keepalive: true,
    });
  } catch (err) {
    console.log('logEvent', name, payload);
  }
}
