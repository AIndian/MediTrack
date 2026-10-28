import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/flutter-browser',
  outputDir: 'test-results-flutter',
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-flutter-report', open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5185', trace: 'retain-on-failure' },
  webServer: {
    command: 'python -m http.server 5185 --bind 127.0.0.1 --directory ../build/web',
    url: 'http://127.0.0.1:5185',
    reuseExistingServer: false,
  },
});
