import { defineConfig } from '@playwright/test';

// Allows CI/local runs to force screenshots for every test, not just failures.
const screenshotMode = (process.env.PLAYWRIGHT_SCREENSHOT as 'on' | 'off' | 'only-on-failure') ?? 'only-on-failure';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://www.ontario.ca',
    screenshot: screenshotMode,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
});
