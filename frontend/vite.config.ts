/// <reference types="vitest" />
import { defineConfig, loadEnv, mergeConfig } from 'vite';
import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'node:path';

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
      exclude: [
        '**/test/**',
        '**/index.ts',
        '**/testBrowser/**',
        '**/*.stories.tsx',
        '**/example/main.tsx',
        '**/vite.*.config.ts',
      ],
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const isDevelopment = mode === 'development';

  return mergeConfig(vitestConfig, {
    server: {
      host: true,
      allowedHosts: ['*', env.VITE_TUNNEL_DOMAIN],
    },
    optimizeDeps: {
      include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'],
    },
    plugins: [
      tailwindcss(),
      react(),
      replace({
        'process.env.CI': process.env.CI,
        preventAssignment: true,
      }),
      ...(isDevelopment
        ? [
            checker({
              typescript: true,
              terminal: true,
            }),
          ]
        : []),
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
        '@ui': path.resolve(__dirname, '../libs/ui/src'),
        '@common': path.resolve(__dirname, '../libs/common/src'),
        '@web': path.resolve(__dirname, '../libs/common/srcBrowser'),
        '@core': path.resolve(__dirname, '../libs/core/src'),
        '@common-test': path.resolve(__dirname, '../libs/common/test'),
        '@web-test': path.resolve(__dirname, '../libs/common/testBrowser'),
        '@core-test': path.resolve(__dirname, '../libs/core/test'),
        '@ui-test': path.resolve(__dirname, '../libs/ui/test'),
        '@stores': '/src/stores',
      },
    },

    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      minify: 'terser',
      cssMinify: true,
      terserOptions: {
        format: {
          comments: false,
        },
        compress: {
          dead_code: true,
          drop_debugger: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          // eslint-disable-next-line @cspell/spellchecker
          hoist_funs: true,
          // eslint-disable-next-line @cspell/spellchecker
          keep_fargs: false,
          hoist_vars: false,
          if_return: true,
          join_vars: true,
          side_effects: true,
        },
      },
    },
  });
});
