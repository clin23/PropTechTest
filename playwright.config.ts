import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: { MOCK_MODE: 'true' },
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
});
