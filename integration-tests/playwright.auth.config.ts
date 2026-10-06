import { randomBytes } from 'node:crypto';
import { defineConfig, devices } from '@playwright/test';
import { APP_URL, LOCAL_OIDC_URL } from './tests-auth/constants';

// Inherited by the webServer commands; a throwaway key per run is enough for test sessions.
process.env.AUTH_COOKIE_SECRET ||= randomBytes(32).toString('base64');

/**
 * Auth E2E suite: the built app with AUTH_ENABLED=true against apps/local-oidc.
 * Run: yarn test:integration auth
 */
export default defineConfig({
  testDir: './tests-auth',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'auth',
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
        },
      },
    },
  ],
  // Both servers are always started fresh: this suite shares port 3345 with the main suite, and
  // reusing a server started without auth would make every test meaningless. They inherit the
  // env.sh and auth/backend.env values loaded by `yarn test:integration auth`.
  webServer: [
    {
      command: 'bash -c "cd .. && npx nx run local-oidc:start"',
      url: `${LOCAL_OIDC_URL}/logout`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'bash -c "cd .. && BYPASS_WAITING_ROOM=false yarn start"',
      url: `${APP_URL}/_/health`,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
