import { Page, expect } from '@playwright/test';
import { baseURL } from '../fixtures/testWithLogging';

export const waitAndClickFirefox = async (page, browserName) => {
  // Firefox needs delay and then click for publisher to initialize
  if (browserName === 'firefox') {
    await page.waitForTimeout(3000);
    await page.locator('#root').click();
  }
};

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
  await page.getByLabel('Name').fill(username);
  await waitAndClickFirefox(page, browserName);
  if (videoOff) {
    await page.getByTestId('camera-button-wrapper').click();
    await expect(page.getByTestId('vivid-icon-video-off-line')).toBeVisible();
  }
  if (audioOff) {
    await page.getByTestId('mic-button-wrapper').click();
    await expect(page.getByTestId('vivid-icon-mic-mute-line')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Join meeting' }).click();
};
