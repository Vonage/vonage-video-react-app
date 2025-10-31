/// <reference types="vitest" />
import { defineConfig, loadEnv, mergeConfig } from 'vite';
import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import checker from 'vite-plugin-checker';

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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return mergeConfig(vitestConfig, {
    server: {
      host: true,
      allowedHosts: ['*', env.VITE_TUNNEL_DOMAIN],
    },
    optimizeDeps: {
      include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'],
    },
    plugins: [
      react(),
      replace({
        'process.env.CI': process.env.CI,
        preventAssignment: true,
      }),
      checker({
        typescript: true,
        terminal: true,
      }),
    ],
    resolve: {
      alias: {
        '@api': '/src/api',
        '@components': '/src/components',
        '@Context': '/src/Context',
        '@hooks': '/src/hooks',
        '@locales': '/src/locales',
        '@pages': '/src/pages',
        '@tests': '/src/tests',
        '@app-types': '/src/types',
        '@utils': '/src/utils',
        '@test': '/src/test',
      },
    },
  });
});
