import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/test-api',
  resolve: {
    alias: {
      '@api-lib': path.resolve(__dirname, '../../libs/api/src'),
      '@common-test': path.resolve(__dirname, '../../libs/common/test'),
      '@common': path.resolve(__dirname, '../../libs/common/src'),
      '@node': path.resolve(__dirname, '../../libs/common/node'),
    },
  },
  test: {
    name: 'test-api',
    watch: false,
    environment: 'node',
    clearMocks: true,
    fileParallelism: false,
    setupFiles: [
      '../../backend/testSetup/documentPolyfill.js',
      '../../backend/testSetup/setEnvVars.js',
    ],
    include: ['**/*.test.ts'],
    reporters: ['default'],
  },
});
