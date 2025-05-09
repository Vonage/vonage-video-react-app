// eslint-disable-next-line import/no-extraneous-dependencies
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
  browserName: string;
}) => {
  await page.goto(`${baseURL}waiting-room/${roomName}`);
  await page.getByPlaceholder('Enter your name').fill(username);
  await waitAndClickFirefox(page, browserName);
  if (videoOff) {
    await page.getByTestId('VideocamIcon').click();
    await expect(page.getByTestId('VideocamOffIcon')).toBeVisible();
  }
  if (audioOff) {
    await page.getByTestId('MicIcon').click();
    await expect(page.getByTestId('MicOffIcon')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Join' }).click();
};
