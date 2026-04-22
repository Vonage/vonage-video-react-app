/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'node:path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/ui',
  plugins: [
    tailwindcss(),
    react(),
    dts({ entryRoot: 'src', tsconfigPath: path.join(__dirname, 'tsconfig.lib.json') }),
  ],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, '../common/src'),
      '@web': path.resolve(__dirname, '../common/srcBrowser'),
      '@common-test': path.resolve(__dirname, '../common/test'),
      '@web-test': path.resolve(__dirname, '../common/testBrowser'),
      '@core': path.resolve(__dirname, '../core/src'),
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
  //     name: 'ui',
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
    name: 'ui',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage',
      provider: 'v8' as const,
      reporter: ['text', 'lcov'],
      allowExternal: true,
      include: [
        `${path.resolve(__dirname, 'src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../common/src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../common/srcBrowser')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../core/src')}/**/*.{ts,tsx}`,
      ],
      exclude: ['test/**', '**/index.ts'],
    },
  },
}));
