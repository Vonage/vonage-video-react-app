import { defineConfig, devices } from '@playwright/test';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require('path');

const isHeadedMode = process.env.headedMode === 'true';
const isDebugMode = process.env.debugMode === 'true';

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
];

const width = 1512;
const height = 824;

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
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  globalSetup: require.resolve('./globalSetup'),
  /* Configure projects for major browsers */
  projects: [
    {
      // -----------------------------------------------------
      // CHROME (real Chrome)
      // -----------------------------------------------------
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width, height },
        channel: 'chrome',
        launchOptions: {
          args: chromiumFlags,
        },
      },
    },

    // -----------------------------------------------------
    // CHROME WITH FAKE DEVICES (simulates multiple cameras/mics)
    // -----------------------------------------------------
    {
      name: 'Google Chrome Fake Devices',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width, height },
        channel: 'chrome',
        launchOptions: {
          args: fakeDeviceChromiumFlags,
        },
      },
    },

    // -----------------------------------------------------
    // FIREFOX
    // -----------------------------------------------------
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width, height },
        launchOptions: {
          // eslint-disable-next-line @cspell/spellchecker
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

    // -----------------------------------------------------
    // SAFARI / WEBKIT
    // -----------------------------------------------------
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width, height },
        launchOptions: {
          args: [], // no media flags allowed for WebKit
        },
      },
    },

    // -----------------------------------------------------
    // EDGE
    // -----------------------------------------------------
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width, height },
        channel: 'msedge',
        launchOptions: {
          args: fakeDeviceChromiumFlags,
        },
      },
    },

    // -----------------------------------------------------
    // MOBILE CHROME (Pixel 5)
    // -----------------------------------------------------
    {
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
    env: {
      VITE_AVOID_FETCHING_APP_CONFIG: 'true',
    },
    ...(isDebugMode
      ? {
          command: 'cd .. && yarn dev',
          url: 'http://localhost:5173/',
        }
      : { command: 'cd .. && yarn start', url: 'http://127.0.0.1:3345' }),
  },
});
