import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      exclude: [
        'src/renderer/src/assets/**'
      ]
    }
  },
  esbuild: {
    jsx: 'automatic'
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, './src/renderer/src')
    }
  }
});
