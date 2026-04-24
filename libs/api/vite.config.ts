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
      '@node': path.resolve(__dirname, '../common/srcNode'),
      '@common-test': path.resolve(__dirname, '../common/test'),
      '@node-test': path.resolve(__dirname, '../common/testNode'),
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
      allowExternal: true,
      include: [
        `${path.resolve(__dirname, 'src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../common/src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../common/srcNode')}/**/*.{ts,tsx}`,
      ],
      exclude: ['test/**', '**/index.ts'],
    },
  },
}));
