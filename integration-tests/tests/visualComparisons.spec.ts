import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';
import {
  TIMEOUTS,
  VIEWPORT,
  SCREENSHOT,
  openMeetingRoomWithSettings,
  waitUntilReady,
} from './utils';

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

  const fixedNow = Date.UTC(2057, 1, 2, 10, 0, 0);
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
    roomName: scheduleState.schedule ? 'weekly-sync' : 'team-standup',
  }));

  const unnamedScheduleStates = scheduleStates
    .filter(({ state }) => state === 'unscheduled' || state === 'days away')
    .map((scheduleState) => ({ ...scheduleState, nameCase: 'without name', roomName: undefined }));

  const scheduleCases = [...namedScheduleStates, ...unnamedScheduleStates];
  const sessionKeys = new Map<string, string>();

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    for (const { state, schedule, nameCase, roomName } of scheduleCases) {
      const createSessionResponse = await request.post(`${baseURL}v2/createSession`, {
        data: { roomName, schedule },
      });
      expect(createSessionResponse.ok()).toBe(true);
      const {
        result: {
          data: { sessionKey },
        },
      } = (await createSessionResponse.json()) as { result: { data: { sessionKey: string } } };
      sessionKeys.set(`${state} ${nameCase}`, sessionKey);
    }
    await request.dispose();
  });

  for (const { state, schedule, nameCase } of scheduleCases) {
    for (const colorScheme of colorSchemes) {
      test(`${state} ${nameCase} ${colorScheme}`, async ({ page, isMobile }) => {
        if (!isMobile) {
          await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
        }
        await serveStaticFilesFromCache(page);

        await page.route(/\/v2\/getServerSettings/, async (route) => {
          const isBatchRequest = new URL(route.request().url()).searchParams.get('batch') === '1';
          const payload = { result: { data: { serverTime: fixedNow } } };
          await route.fulfill({ json: isBatchRequest ? [payload] : payload });
        });

        await page.clock.setFixedTime(fixedNow);
        await page.goto(`${baseURL}waiting-room/${sessionKeys.get(`${state} ${nameCase}`)}`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.video__element')).toBeAttached();
        await expect(page.getByText('Prepare to join')).toBeVisible();
        await expect(page.getByText(/^to \d/)).toHaveCount(schedule ? 1 : 0);
        await page.emulateMedia({ colorScheme });
        await page.waitForFunction(
          (isDark) => document.documentElement.classList.contains('dark') === isDark,
          colorScheme === 'dark'
        );
        await expect(page).toHaveScreenshot({
          mask: [page.locator('.video__element'), page.locator('[data-testid="app-version"]')],
          maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
          timeout: TIMEOUTS.DEFAULT,
        });
      });
    }
  }
});
test.describe('Meeting room timer UI test', () => {
  const minuteInMilliseconds = 60_000;
  const colorSchemes = ['light', 'dark'] as const;
  test('before the last five minutes', async ({ page, request, isMobile, browserName }) => {
    await openScheduledMeetingRoom({
      page,
      request,
      isMobile,
      browserName,
      colorScheme: 'light',
      minutesLeft: 6,
    });
    await expect(page.getByRole('timer')).toBeHidden();
    await expect(page).toHaveScreenshot(getMeetingRoomScreenshotOptions(page));
  });
  for (const colorScheme of colorSchemes) {
    test(`about to finish ${colorScheme}`, async ({ page, request, isMobile, browserName }) => {
      test.skip(
        colorScheme === 'dark' && browserName === 'firefox',
        'Firefox ignores the emulated dark color scheme'
      );
      const { endsAt } = await openScheduledMeetingRoom({
        page,
        request,
        isMobile,
        browserName,
        colorScheme,
        minutesLeft: 6,
      });
      await page.clock.setFixedTime(endsAt - 4 * minuteInMilliseconds);
      await expect(page.getByText('The meeting is about to finish')).toBeVisible();
      await expect(page.getByRole('timer')).toHaveText('4 min left');
      await expect(page).toHaveScreenshot(getMeetingRoomScreenshotOptions(page));
      await page.getByRole('button', { name: 'Dismiss notification' }).click();
      await expect(page.getByText('The meeting is about to finish')).toBeHidden();
      await page.mouse.move(0, 0);
      await expect(page.getByRole('tooltip')).toBeHidden();
      await expect(page).toHaveScreenshot(getMeetingRoomScreenshotOptions(page));
    });
  }
  async function openScheduledMeetingRoom({
    page,
    request,
    isMobile,
    browserName,
    colorScheme,
    minutesLeft,
  }: {
    page: Page;
    request: APIRequestContext;
    isMobile: boolean;
    browserName: string;
    colorScheme: (typeof colorSchemes)[number];
    minutesLeft: number;
  }) {
    if (!isMobile) {
      await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
    }
    const startsAt = Math.floor(Date.now() / 1000) * 1000 - 10 * minuteInMilliseconds;
    const durationMinutes = 60;
    const endsAt = startsAt + durationMinutes * minuteInMilliseconds;
    const clientNow = endsAt - minutesLeft * minuteInMilliseconds;
    const createSessionResponse = await request.post(`${baseURL}v2/createSession`, {
      data: { schedule: { startsAt, durationMinutes } },
    });
    expect(createSessionResponse.ok()).toBe(true);
    const { result } = await createSessionResponse.json();
    await page.route(/\/v2\/getServerSettings/, async (route) => {
      const isBatchRequest = new URL(route.request().url()).searchParams.get('batch') === '1';
      const payload = { result: { data: { serverTime: clientNow } } };
      await route.fulfill({ json: isBatchRequest ? [payload] : payload });
    });
    await page.emulateMedia({ colorScheme });
    await page.clock.setFixedTime(clientNow);
    await openMeetingRoomWithSettings({
      page,
      roomName: result.data.sessionKey,
      username: 'User One',
      videoOff: true,
      browserName,
    });
    await page.clock.setSystemTime(clientNow);
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });
    await expect(page.getByTestId('progress-spinner')).toBeHidden();
    await expect(page.getByTestId('publisher-container').getByText('User One')).toBeVisible({
      timeout: TIMEOUTS.DEFAULT * 3,
    });
    await page.clock.setFixedTime(clientNow);
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toBeHidden();
    return { endsAt };
  }
  function getMeetingRoomScreenshotOptions(page: Page) {
    return {
      mask: [
        page.locator('[data-testid="app-version"]'),
        page.locator('[data-testid="time-room-name"]'),
      ],
      maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
      timeout: TIMEOUTS.DEFAULT,
    };
  }
});

const staticFileCache = new Map<
  string,
  { status: number; headers: Record<string, string>; body: Buffer }
>();

// The backend rate limit counts the page and its static files, so each worker fetches them once.
async function serveStaticFilesFromCache(page: Page) {
  const isStaticFile = (url: URL) =>
    ['assets/', 'images/', 'waiting-room/'].some((folder) =>
      url.href.startsWith(`${baseURL}${folder}`)
    );

  await page.route(isStaticFile, async (route) => {
    const cacheKey = route.request().isNavigationRequest() ? 'index.html' : route.request().url();
    const cachedStaticFile = staticFileCache.get(cacheKey);
    if (cachedStaticFile) return route.fulfill(cachedStaticFile);

    const response = await route.fetch();
    const staticFile = {
      status: response.status(),
      headers: response.headers(),
      body: await response.body(),
    };
    staticFileCache.set(cacheKey, staticFile);
    await route.fulfill(staticFile);
  });
}
