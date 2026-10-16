import { defineConfig, mergeConfig } from 'vite';
import baseConfigFn from '../../vite.config';
import * as path from 'node:path';

export default defineConfig((env) => {
  const baseConfig = baseConfigFn(env);

  const mergedConfig = mergeConfig(baseConfig, {
    base: './',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    esbuild: {
      jsxDev: false,
    },
    build: {
      outDir: path.resolve(__dirname, '../../distRoom'),
      emptyOutDir: true,

      lib: {
        entry: path.resolve(__dirname, './index.ts'),
        name: 'VeraRoom',
        formats: ['iife'],
        fileName: () => 'room.js',
      },

      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  });

  // This single-format iife lib build forces inlineDynamicImports, which Rollup rejects combined
  // with manualChunks; mergeConfig skips `undefined` overrides, so it's deleted directly instead.
  const output = mergedConfig.build?.rollupOptions?.output;
  if (output && !Array.isArray(output)) {
    delete output.manualChunks;
  }

  return mergedConfig;
});
