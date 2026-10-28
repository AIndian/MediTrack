import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['test/{unit,component}/**/*.test.{js,jsx}'],
    setupFiles: ['./test/setup.js'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportOnFailure: true,
      thresholds: { lines: 60, statements: 60, functions: 60, branches: 60 },
    },
  },
});
