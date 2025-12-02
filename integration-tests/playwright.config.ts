import { defineConfig, devices } from '@playwright/test';
import path = require('path');

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

const width = 1512;
const height = 824;

const isMac = process.platform === 'darwin';

const executablePath = isMac ? '/Applications/Opera.app/Contents/MacOS/Opera' : '/usr/bin/opera';

const fakeDeviceChromiumFlags = [
  ...chromiumFlags,
  '--headless=new',
  '--use-fake-device-for-media-stream=device-count=5',
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
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width, height },
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
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width, height },
        launchOptions: {
          args: ['--enable-mock-capture-devices=true', '--enable-media-stream=true'],
        },
      },
    },
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
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: fakeDeviceChromiumFlags,
        },
      },
    },
    {
      name: 'Opera',
      use: {
        viewport: { width, height },
        launchOptions: {
          args: fakeDeviceChromiumFlags,
          executablePath,
        },
      },
    },
    {
      name: 'Electron',
      use: {
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
        contextOptions: {
          viewport: { width, height },
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'cd .. && yarn start',
    url: 'http://127.0.0.1:3345',
    reuseExistingServer: true,
  },
});
