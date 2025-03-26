/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';
import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';

const vitestConfig: VitestUserConfigInterface = defineVitestConfig({
  test: {
    globalSetup: './src/test/globals.ts',
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    server: {
      deps: {
        fallbackCJS: true,
        inline: ['cliui', 'yargs', 'wrap-ansi'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});

// https://vitejs.dev/config/
const viteConfig = defineConfig({
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'],
  },
  plugins: [
    react(),
    replace({
      'process.env.CI': process.env.CI,
      preventAssignment: true,
    }),
  ],
});

export default mergeConfig(vitestConfig, viteConfig);
