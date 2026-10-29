import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/backend',
  resolve: {
    alias: {
      '@api-lib': path.resolve(__dirname, '../libs/api/src'),
      '@common-test': path.resolve(__dirname, '../libs/common/test'),
      '@common': path.resolve(__dirname, '../libs/common/src'),
      '@node': path.resolve(__dirname, '../libs/common/node'),
    },
  },
  test: {
    name: 'backend',
    watch: false,
    environment: 'node',
    clearMocks: true,
    fileParallelism: false,
    setupFiles: ['./testSetup/documentPolyfill.js', './testSetup/setEnvVars.js'],
    include: ['**/*.test.ts', 'tests/**/*.ts'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**', 'tests/helpers/**'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage',
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/index.ts',
        '**/*.test.ts',
        'storage/sessionStorage.ts',
        'vitest.config.ts',
      ],
    },
  },
});
