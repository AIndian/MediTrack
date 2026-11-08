import { defineConfig } from '../react/node_modules/vite/dist/node/index.js';
import react from '../react/node_modules/@vitejs/plugin-react/dist/index.js';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  publicDir: '../react/public',
  resolve: {
    alias: {
      react: fileURLToPath(new URL('../react/node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('../react/node_modules/react-dom', import.meta.url)),
      'react-router-dom': fileURLToPath(new URL('../react/node_modules/react-router-dom', import.meta.url)),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
});
