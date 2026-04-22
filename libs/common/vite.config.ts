/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import * as path from 'node:path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/common',
  plugins: [
    react(),
    dts({ entryRoot: 'src', tsconfigPath: path.join(__dirname, 'tsconfig.lib.json') }),
  ],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src'),
      '@common-test': path.resolve(__dirname, './test'),
      '@web-test': path.resolve(__dirname, './testBrowser'),
      '@node-test': path.resolve(__dirname, './testNode'),
      '@web': path.resolve(__dirname, './srcBrowser'),
      '@node': path.resolve(__dirname, './srcNode'),
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  // build: {
  //   outDir: './dist',
  //   emptyOutDir: true,
  //   reportCompressedSize: true,
  //   commonjsOptions: { transformMixedEsModules: true },
  //   lib: {
  //     // Could also be a dictionary or array of multiple entry points.
  //     entry: 'src/index.ts',
  //     name: 'common',
  //     fileName: 'index',
  //     // Change this to the formats you want to support.
  //     // Don't forget to update your package.json as well.
  //     formats: ['es' as const],
  //   },
  //   rollupOptions: {
  //     // External packages that should not be bundled into your library.
  //     external: ['react', 'react-dom', 'react/jsx-runtime'],
  //   },
  // },
  test: {
    name: 'common',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    include: ['{src,srcBrowser,srcNode,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage',
      provider: 'v8' as const,
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'srcBrowser/**/*.{ts,tsx}', 'srcNode/**/*.{ts,tsx}'],
      exclude: ['test/**', 'testBrowser/**', 'testNode/**', '**/index.ts'],
    },
  },
}));
