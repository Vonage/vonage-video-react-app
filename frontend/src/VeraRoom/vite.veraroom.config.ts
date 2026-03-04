import { defineConfig, mergeConfig } from 'vite';
import baseConfigFn from '../../vite.config';
import * as path from 'node:path';

export default defineConfig((env) => {
  const baseConfig = baseConfigFn(env);
  const isDevelopment = env.mode === 'development';

  return mergeConfig(baseConfig, {
    base: './',
    define: {
      'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"',
    },
    build: {
      outDir: path.resolve(__dirname, '../../distRoom'),
      emptyOutDir: true,

      lib: {
        entry: path.resolve(__dirname, './index.ts'),
        name: 'VeraRoom',
        formats: ['iife'],
        fileName: () => 'vera-room.js',
      },

      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  });
});
