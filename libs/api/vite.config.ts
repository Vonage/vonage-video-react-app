/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'node:path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/api',
  resolve: {
    alias: {
      '@api-lib': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, '../common/src'),
    },
  },
  test: {
    name: 'api',
    watch: false,
    globals: true,
    environment: 'node',
    setupFiles: './test/setup.ts',
    include: ['{src,test}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage',
      provider: 'v8' as const,
      reporter: ['text', 'lcov'],
    },
  },
}));
