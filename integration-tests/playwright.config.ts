import { defineConfig, devices } from '@playwright/test';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require('path');
import { VIEWPORT } from './tests/utils';

const isHeadedMode = process.env.headedMode === 'true';
const isDebugMode = process.env.debugMode === 'true';
const isInspectMode = process.env.inspectMode === 'true';

/**
 * Chromium media testing flags
 * (Fake audio, mock UI, screen capture, autoplay, etc.)
 */
const chromiumFlags = [
  '--use-fake-ui-for-media-stream',
  '--autoplay-policy=no-user-gesture-required',
  '--auto-select-desktop-capture-source=Entire screen',
  '--enable-usermedia-screen-capturing',
  '--allow-http-screen-capture',
  '--mute-audio',
  `--use-file-for-fake-audio-capture=${path.resolve(
    __dirname,
    'quality_macOS_Test_Resources_female_aqua_48000.wav'
  )}`,
];

const fakeDeviceChromiumFlags = [
  ...chromiumFlags,

  // headless only on CI
  ...(isHeadedMode ? [] : ['--headless=new']),

  '--use-fake-device-for-media-stream=device-count=5',

  // Font rendering consistency across environments
  '--font-render-hinting=none',
  '--disable-font-subpixel-positioning',
  '--disable-lcd-text',

  // Open browser in fullscreen mode when headed
  ...(isInspectMode || isDebugMode ? ['--start-maximized'] : []),
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* There are plenty of flaky test so retry is needed */
  retries: process.env.CI ? 2 : 0,
  /* Enable parallel execution with 2 workers on CI for faster runs */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    ...(isInspectMode || isDebugMode
      ? {
          launchOptions: {
            devtools: isInspectMode,
          },
          navigationTimeout: 1000 * 60 * 5, // 5 minutes
          actionTimeout: 1000 * 60 * 5, // 5 minutes
        }
      : {}),
  },
  globalSetup: require.resolve('./globalSetup'),
  /* Configure projects for major browsers */
  projects: [
    {
      // Desktop Chromium (Fake Devices, stable for automation)
      name: 'Google Chrome Fake Devices',
      use: {
        ...(isInspectMode || isDebugMode ? {} : devices['Desktop Chrome']),
        viewport:
          isInspectMode || isDebugMode ? null : { width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT },
        launchOptions: {
          args: fakeDeviceChromiumFlags,
          devtools: isInspectMode,
        },
      },
    },
    {
      // Desktop Firefox
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT },
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.permission.disabled': true,
            'media.navigator.streams.fake': true,
            'app.update.enabled': false,
            'media.autoplay.default': 0,
            'media.peerconnection.ice.proxy_only': false,
            'media.peerconnection.ice.loopback': false,
          },
        },
      },
    },
    {
      // Desktop Safari / WebKit
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT },
        launchOptions: {
          args: [],
        },
      },
    },
    {
      // Mobile Chromium (Pixel 5)
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: fakeDeviceChromiumFlags,
        },
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes for CI builds with terser minification
    env: {
      AVOID_FETCHING_APP_CONFIG: 'true',
      BYPASS_WAITING_ROOM: 'false',
    },

    ...(isDebugMode
      ? {
          command:
            'bash -c "cd .. && source vcrBuild.env.sh && AVOID_FETCHING_APP_CONFIG=true BYPASS_WAITING_ROOM=false yarn dev"',
          url: 'http://localhost:5173/',
        }
      : {
          command:
            'bash -c "cd .. && source vcrBuild.env.sh && AVOID_FETCHING_APP_CONFIG=true BYPASS_WAITING_ROOM=false yarn start"',
          url: 'http://127.0.0.1:3345',
        }),
  },
});
