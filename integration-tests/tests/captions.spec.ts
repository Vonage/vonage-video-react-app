import { expect, type Page } from '@playwright/test';
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
