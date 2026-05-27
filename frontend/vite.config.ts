/// <reference types="vitest" />
import { defineConfig, loadEnv, mergeConfig } from 'vite';
import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'node:path';
import fs from 'node:fs';

const VITEST_WEB_SOCKET_PORT = 51205;

// Explicitly list every key the Env class reads.
// In test mode we skip all custom vars so the Env class defaults apply
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
  'MEETING_ROOM_ALLOW_ADVANCED_SETTINGS',
  'WAITING_ROOM_ALLOW_ADVANCED_SETTINGS',
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

function loadDotEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const lines = fileContent.split('\n');

  const meaningfulLines = lines.filter((line) => {
    const trimmedLine = line.trim();

    return trimmedLine !== '' && !trimmedLine.startsWith('#');
  });

  const parseDotEnvLine = (line: string): [string, string] | null => {
    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) return null;

    const rawKey = line.slice(0, equalsIndex);
    const rawValue = line.slice(equalsIndex + 1);

    const key = rawKey.trim();
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '');

    if (key === '') {
      return null;
    }

    return [key, value];
  };

  const envEntries = meaningfulLines
    .map(parseDotEnvLine)
    .filter((entry): entry is [string, string] => entry !== null);

  return Object.fromEntries(envEntries);
}

const getLocalEnvironmentValues = ({ mode }: { mode: string }) => {
  type EnvKey = (typeof appEnvKeys)[number];
  const fileEnv: Record<EnvKey, string> = {} as Record<EnvKey, string>;

  for (const file of ['.env', `.env.${mode}`]) {
    Object.assign(fileEnv, loadDotEnvFile(path.resolve(__dirname, file)));
  }

  return fileEnv;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const fileEnv = getLocalEnvironmentValues({ mode });

  const isDevelopment = mode === 'development';
  const isTest = mode === 'test';

  const appEnvObject = {
    MODE: mode,
    ...(isTest
      ? {}
      : Object.fromEntries(appEnvKeys.map((key) => [key, fileEnv[key] ?? env[key] ?? '']))),
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
