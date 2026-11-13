import { expect, type Locator, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

type ClickCaptionsButtonArgs = {
  page: Page;
  isMobile: boolean;
};

/**
 * Clicks the captions button on the given page.
 * On mobile, opens the overflow menu first.
 */
async function clickCaptionsButton({ page, isMobile }: ClickCaptionsButtonArgs): Promise<void> {
  if (isMobile) {
    await page.getByTestId('MoreVertIcon').click();
    await page.mouse.move(0, 0);
  }

  await page.getByTestId('captions-button').click();
}

/**
 * Asserts that the captions box is visible.
 * Fails the test if the captions box does not appear within the timeout.
 */
async function assertCaptionsBox(page: Page): Promise<void> {
  await expect(page.getByTestId('captions-box')).toBeVisible({ timeout: 10_000 });
}

/**
 * Tries to assert captions box visibility.
 * Returns { error: null } on success, or { error } if the box didn't appear.
 */
async function tryCaptionsBox(page: Page): Promise<{ error: Error | null; didFail: boolean }> {
  try {
    await assertCaptionsBox(page);
    return { error: null, didFail: false };
  } catch (error) {
    return { error: error as Error, didFail: true };
  }
}

test.describe('captions', () => {
  const areCaptionsEnabled = process.env.ALLOW_CAPTIONS !== 'false';

  test.skip(!areCaptionsEnabled, 'Skipping captions tests when captions are disabled');

  test('should display captions button in the toolbar', async ({ page, browserName, isMobile }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    if (isMobile) {
      await page.getByTestId('MoreVertIcon').click();
      await page.mouse.move(0, 0);
    }

    await expect(page.getByTestId('captions-button')).toBeVisible();
  });

  test('should display the correct initial icon on captions button', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    if (isMobile) {
      await page.getByTestId('MoreVertIcon').click();
      await page.mouse.move(0, 0);
    }

    const captionsButton = page.getByTestId('captions-button');

    // Initial state: "closed-captioning-solid" icon (captions off)
    await expect(
      captionsButton.locator('[data-testid="vivid-icon-closed-captioning-solid"]')
    ).toBeVisible();
  });

  test('should respond to captions button click with box', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    await clickCaptionsButton({ page, isMobile });

    await tryCaptionsBox(page);

    // Captions box appeared successfully
    await expect(page.getByTestId('captions-box')).toBeVisible();
  });

  test('should hide captions box when captions are toggled off', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    // Enable captions
    await clickCaptionsButton({ page, isMobile });
    await assertCaptionsBox(page);

    // Disable captions
    await clickCaptionsButton({ page, isMobile });
    await expect(page.getByTestId('captions-box')).not.toBeVisible();
  });

  test('should change captions icon after successful enable', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    await clickCaptionsButton({ page, isMobile });
    await assertCaptionsBox(page);

    if (isMobile) {
      await page.getByTestId('MoreVertIcon').click();
      await page.mouse.move(0, 0);
    }

    const captionsButton = page.getByTestId('captions-button');

    // After successful enable: "closed-captioning-off-solid" icon is shown
    await expect(
      captionsButton.locator('[data-testid="vivid-icon-closed-captioning-off-solid"]')
    ).toBeVisible();
  });
});

test.describe('captions enable failure', () => {
  const areCaptionsEnabled = process.env.ALLOW_CAPTIONS !== 'false';
  test.skip(!areCaptionsEnabled, 'Skipping captions tests when captions are disabled');

  test('should keep captions off when enabling them fails', async ({ page, browserName }) => {
    const ensureCaptionsEnabledRequests = await mockEnsureCaptionsEnabledFailure(page);
    await joinMeetingRoom({ page, username: 'User One', browserName });

    await (await getCaptionsButton(page)).click();

    await expect.poll(() => ensureCaptionsEnabledRequests.count).toBe(1);
    await expect(page.getByTestId('captions-box')).toHaveCount(0);
    await expectCaptionsButtonState({ page, isEnabled: false });
  });

  test('should show the captions error when enabling them fails', async ({ page, browserName }) => {
    test.fail(
      true,
      'CaptionsButton only reports AxiosError failures, but the tRPC video client throws TRPCClientError'
    );

    await mockEnsureCaptionsEnabledFailure(page);
    await joinMeetingRoom({ page, username: 'User One', browserName });

    await (await getCaptionsButton(page)).click();

    await expect(page.getByTestId('captions-error')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('captions-error')).toContainText('Captions error:');
    await expectCaptionsButtonState({ page, isEnabled: false });
  });
});

test.describe('captions with multiple participants', () => {
  const areCaptionsEnabled = process.env.ALLOW_CAPTIONS !== 'false';
  test.skip(!areCaptionsEnabled, 'Skipping captions tests when captions are disabled');

  test('should keep captions on for a participant after the other one turns them off', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');
    await joinMeetingRoom({ page: pageOne, username: 'User One', roomName, browserName });
    const pageTwo = await context.newPage();
    await joinMeetingRoom({ page: pageTwo, username: 'User Two', roomName, browserName });
    await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
      timeout: 20_000,
    });

    for (const page of [pageOne, pageTwo]) {
      await (await getCaptionsButton(page)).click();
      await assertCaptionsBox(page);
      await expectCaptionsButtonState({ page, isEnabled: true });
    }

    await (await getCaptionsButton(pageOne)).click();

    await expect(pageOne.getByTestId('captions-box')).toHaveCount(0);
    await expectCaptionsButtonState({ page: pageOne, isEnabled: false });
    await expect(pageTwo.getByTestId('captions-box')).toBeVisible();
    await expectCaptionsButtonState({ page: pageTwo, isEnabled: true });

    await (await getCaptionsButton(pageTwo)).click();

    await expect(pageTwo.getByTestId('captions-box')).toHaveCount(0);
    await expectCaptionsButtonState({ page: pageTwo, isEnabled: false });
  });
});

async function joinMeetingRoom({
  page,
  username,
  roomName = crypto.randomBytes(5).toString('hex'),
  browserName,
}: {
  page: Page;
  username: string;
  roomName?: string;
  browserName: string;
}): Promise<void> {
  await openMeetingRoomWithSettings({ page, username, roomName, browserName });
  await expect(page.locator('.publisher')).toBeVisible();
  await expect(page.getByTestId('progress-spinner')).toHaveCount(0, { timeout: 20_000 });
}

async function getCaptionsButton(page: Page): Promise<Locator> {
  const visibleCaptionsButton = page.locator('[data-testid="captions-button"]:visible');

  const isButtonInToolbar = (await visibleCaptionsButton.count()) > 0;
  if (!isButtonInToolbar) {
    await toggleToolbarOverflowMenu(page);
  }

  return visibleCaptionsButton.first();
}

async function expectCaptionsButtonState({
  page,
  isEnabled,
}: {
  page: Page;
  isEnabled: boolean;
}): Promise<void> {
  const isButtonInToolbar =
    (await page.locator('[data-testid="captions-button"]:visible').count()) > 0;
  const captionsButton = await getCaptionsButton(page);
  const expectedIconTestId = isEnabled
    ? 'vivid-icon-closed-captioning-off-solid'
    : 'vivid-icon-closed-captioning-solid';

  await expect(captionsButton.getByTestId(expectedIconTestId)).toBeVisible();

  if (!isButtonInToolbar) {
    await toggleToolbarOverflowMenu(page);
  }
}

async function toggleToolbarOverflowMenu(page: Page): Promise<void> {
  await page.getByTestId('hidden-toolbar-items').click();
  await page.mouse.move(0, 0);
}

async function mockEnsureCaptionsEnabledFailure(page: Page): Promise<{ count: number }> {
  const requests = { count: 0 };

  await page.route(/\/v2\/ensureCaptionsEnabled/, async (route) => {
    requests.count++;
    const errorPayload = {
      error: {
        message: 'Captions service unavailable',
        code: -32603,
        data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500, path: 'ensureCaptionsEnabled' },
      },
    };
    const isBatchRequest = new URL(route.request().url()).searchParams.get('batch') === '1';

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify(isBatchRequest ? [errorPayload] : errorPayload),
    });
  });

  return requests;
}
