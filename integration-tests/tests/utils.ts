import { Page, expect } from '@playwright/test';
import { baseURL } from '../fixtures/testWithLogging';

export const waitUntilReady = async (page, browserName) => {
  // Firefox needs delay and then click for publisher to initialize
  if (browserName === 'firefox') {
    await page.waitForTimeout(3000);
    await page.locator('#root').click();
  } else {
    await page.waitForTimeout(1000);
  }
};

// Standard timeout values used across integration tests
export const TIMEOUTS = {
  /** Default timeout for most async operations (5s) */
  DEFAULT: 5000,
} as const;

// Standard viewport dimensions for consistent screenshots and tests
export const VIEWPORT = {
  WIDTH: 1512,
  HEIGHT: 824,
} as const;

// Screenshot comparison settings
export const SCREENSHOT = {
  /** Maximum allowed pixel ratio differences for cross-platform screenshot comparisons (5% tolerance) */
  MAX_DIFF_PIXEL_RATIO: 0.5,
} as const;

export const openMeetingRoomWithSettings = async ({
  page,
  roomName,
  username,
  videoOff = false,
  audioOff = false,
  browserName,
}: {
  page: Page;
  roomName: string;
  username: string;
  videoOff?: boolean;
  audioOff?: boolean;
  browserName?: string;
}) => {
  await page.goto(`${baseURL}waiting-room/${roomName}`);

  await waitUntilReady(page, browserName);

  await page.getByLabel('Name').fill(username);

  if (videoOff) {
    await page.getByTestId('video-container-button').nth(1).click();
    await expect(page.getByTestId('vivid-icon-video-off-line')).toBeVisible();
  }
  if (audioOff) {
    await page.getByTestId('video-container-button').first().click();
    await expect(page.getByTestId('vivid-icon-mic-mute-line')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Join meeting' }).click();
};
