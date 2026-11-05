import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';
import { TIMEOUTS, VIEWPORT, SCREENSHOT } from './utils';

test('Landing page UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }

  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // Let page settle for screenshot
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});

test('Waiting page UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }

  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(`${baseURL}waiting-room/test-room`);
  await page.waitForLoadState('networkidle');
  await page
    .waitForSelector('.video__element', { state: 'attached', timeout: TIMEOUTS.DEFAULT })
    .catch(() => {});
  await page.waitForTimeout(500); // Let page settle for screenshot
  await expect(page).toHaveScreenshot({
    mask: [page.locator('.video__element'), page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});

test('Unsupported browser page UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }

  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(`${baseURL}unsupported-browser`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // Let page settle for screenshot
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});

test.describe('Waiting page schedule UI test', () => {
  test.use({ timezoneId: 'UTC', locale: 'en-US' });

  const fixedNow = Date.UTC(2024, 1, 2, 10, 0, 0);
  const minuteInMilliseconds = 60_000;
  const hourInMilliseconds = 60 * minuteInMilliseconds;
  const dayInMilliseconds = 24 * hourInMilliseconds;

  const scheduleStates = [
    { state: 'unscheduled', schedule: undefined },
    {
      state: 'days away',
      schedule: { startsAt: fixedNow + 2 * dayInMilliseconds, durationMinutes: 30 },
    },
    {
      state: 'within a day',
      schedule: { startsAt: fixedNow + 2 * hourInMilliseconds, durationMinutes: 30 },
    },
    {
      state: 'within five minutes',
      schedule: { startsAt: fixedNow + 3 * minuteInMilliseconds, durationMinutes: 30 },
    },
    {
      state: 'started',
      schedule: { startsAt: fixedNow - 10 * minuteInMilliseconds, durationMinutes: 60 },
    },
    {
      state: 'ended',
      schedule: { startsAt: fixedNow - 2 * hourInMilliseconds, durationMinutes: 30 },
    },
  ];

  const colorSchemes = ['light', 'dark'] as const;

  const namedScheduleStates = scheduleStates.map((scheduleState) => ({
    ...scheduleState,
    nameCase: 'with name',
    roomName: 'weekly-sync',
  }));

  const unnamedScheduleStates = scheduleStates
    .filter(({ state }) => state === 'unscheduled' || state === 'days away')
    .map((scheduleState) => ({ ...scheduleState, nameCase: 'without name', roomName: undefined }));

  for (const { state, schedule, nameCase, roomName } of [
    ...namedScheduleStates,
    ...unnamedScheduleStates,
  ]) {
    for (const colorScheme of colorSchemes) {
      test(`${state} ${nameCase} ${colorScheme}`, async ({ page, request, isMobile }) => {
        if (!isMobile) {
          await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
        }

        const createSessionResponse = await request.post(`${baseURL}v2/createSession`, {
          data: { roomName, schedule },
        });
        expect(createSessionResponse.ok()).toBe(true);
        const { result } = await createSessionResponse.json();

        await page.route(/\/v2\/getServerSettings/, async (route) => {
          const isBatchRequest = new URL(route.request().url()).searchParams.get('batch') === '1';
          const payload = { result: { data: { serverTime: fixedNow } } };
          await route.fulfill({ json: isBatchRequest ? [payload] : payload });
        });

        await page.emulateMedia({ colorScheme });
        await page.clock.setFixedTime(fixedNow);
        await page.goto(`${baseURL}waiting-room/${result.data.sessionKey}`);
        await page.waitForLoadState('networkidle');
        await page
          .waitForSelector('.video__element', { state: 'attached', timeout: TIMEOUTS.DEFAULT })
          .catch(() => {});
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot({
          mask: [page.locator('.video__element'), page.locator('[data-testid="app-version"]')],
          maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
          timeout: TIMEOUTS.DEFAULT,
        });
      });
    }
  }
});
