import { createRequire } from 'node:module';
const require = createRequire(new URL('../react/package.json', import.meta.url));
const { defineConfig, globalIgnores } = require('eslint/config');
const js = require('@eslint/js');
const hooks = require('eslint-plugin-react-hooks');
const globals = require('globals');
export default defineConfig([
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'release/**',
    'reports/**',
    'test-results/**',
    'playwright-report/**',
    '.cache/**',
    'evidence/**',
  ]),
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  { files: ['src/**/*.jsx'], languageOptions: { globals: globals.browser }, extends: [hooks.configs.flat.recommended] },
  {
    files: ['test/e2e/**/*.cjs'],
    languageOptions: { globals: globals.browser },
    rules: { 'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }] },
  },
]);
