import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['node_modules/**', 'dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  {
    files: ['src/**/*.{js,jsx}', 'test/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js', 'test/e2e/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [hooks.configs.flat.recommended],
  },
]);
