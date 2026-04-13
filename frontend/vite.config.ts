/// <reference types="vitest" />
import { defineConfig, loadEnv, mergeConfig } from 'vite';
import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'node:path';

const VITEST_WEB_SOCKET_PORT = 51205;

const vitestConfig: VitestUserConfigInterface = defineVitestConfig({
  test: {
    globalSetup: './src/test/globals.ts',
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    onConsoleLog(log) {
      if (
        log.includes('MUI: You are providing a disabled') ||
        log.includes('OpenTok:') ||
        log.includes('@layer')
      ) {
        return false;
      }

      return true;
    },
    api: {
      port: VITEST_WEB_SOCKET_PORT,
      strictPort: false,
    },
    server: {
      deps: {
        fallbackCJS: true,
        inline: ['cliui', 'yargs', 'wrap-ansi'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      allowExternal: true,
      include: [
        `${path.resolve(__dirname, 'src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../libs/common/src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../libs/common/srcBrowser')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../libs/core/src')}/**/*.{ts,tsx}`,
        `${path.resolve(__dirname, '../libs/ui/src')}/**/*.{ts,tsx}`,
      ],
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
  const isTest = mode === 'test';

  // Explicitly list every key the Env class reads.
  // In test mode we skip all custom vars so the Env class defaults apply
  // (avoids injecting values sourced from vcrBuild.env.sh into tests).
  // In non-test mode we expose only these known keys — no leakage of
  // PATH, secrets, etc. that envPrefix: '' would expose.
  const appEnvKeys = [
    'I18N_FALLBACK_LANGUAGE',
    'I18N_SUPPORTED_LANGUAGES',
    'ENABLE_REPORT_ISSUE',
    'ALLOW_BACKGROUND_EFFECTS',
    'ALLOW_CAMERA_CONTROL',
    'ALLOW_VIDEO_ON_JOIN',
    'ALLOW_ADVANCED_NOISE_SUPPRESSION',
    'ALLOW_AUDIO_ON_JOIN',
    'ALLOW_MICROPHONE_CONTROL',
    'WAITING_ROOM_ALLOW_DEVICE_SELECTION',
    'ALLOW_ARCHIVING',
    'ALLOW_CAPTIONS',
    'ALLOW_CHAT',
    'MEETING_ROOM_ALLOW_DEVICE_SELECTION',
    'ALLOW_EMOJIS',
    'ALLOW_SCREEN_SHARE',
    'SHOW_PARTICIPANT_LIST',
    'BYPASS_WAITING_ROOM',
    'AVOID_FETCHING_APP_CONFIG',
    'DEFAULT_RESOLUTION',
    'DEFAULT_LAYOUT_MODE',
    'API_URL',
    'TUNNEL_DOMAIN',
    'SHOW_VIDEO_STATS',
    'VONAGE_VIDEO_HOST',
  ] as const;

  const appEnvObject = {
    MODE: mode,
    ...(isTest ? {} : Object.fromEntries(appEnvKeys.map((key) => [key, env[key] ?? '']))),
  };

  return mergeConfig(vitestConfig, {
    define: {
      __APP_ENV__: JSON.stringify(appEnvObject),
    },
    server: {
      host: true,
      allowedHosts: ['*', env.TUNNEL_DOMAIN],
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
        '@stores': '/src/stores',
        '@services': '/src/services',
        '@test': '/src/test',
        '@ui': path.resolve(__dirname, '../libs/ui/src'),
        '@common': path.resolve(__dirname, '../libs/common/src'),
        '@web': path.resolve(__dirname, '../libs/common/srcBrowser'),
        '@core': path.resolve(__dirname, '../libs/core/src'),
        '@common-test': path.resolve(__dirname, '../libs/common/test'),
        '@web-test': path.resolve(__dirname, '../libs/common/testBrowser'),
        '@core-test': path.resolve(__dirname, '../libs/core/test'),
        '@ui-test': path.resolve(__dirname, '../libs/ui/test'),
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
