import { createRequire } from 'node:module';
const require = createRequire(new URL('../react/package.json', import.meta.url));
const { defineConfig } = require('@playwright/test');
export default defineConfig({
  testDir: './test/e2e',
  timeout: 60000,
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/electron-results.json' }],
  ],
  outputDir: 'test-results',
});
