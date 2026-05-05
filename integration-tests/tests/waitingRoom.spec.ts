import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(`${baseURL}waiting-room/test-room`);
  await page.waitForTimeout(1000);
});

test('The buttons in the meeting room should match those in the waiting room with enabled buttons', async ({
  page,
  browserName,
  isMobile,
}) => {
  // Check icons in the video preview area (first .video-container-button)
  await expect(
    page.getByTestId('video-container-button').first().getByTestId('vivid-icon-microphone-line')
  ).toBeVisible();

  await expect(
    page.getByTestId('video-container-button').nth(1).getByTestId('vivid-icon-video-line')
  ).toBeVisible();
  await expect(page.getByTestId('PersonIcon')).toHaveCount(0);

  if (browserName !== 'firefox') {
    await expect(page.getByTestId('portraitIcon')).toBeVisible();
  }
  await page.getByLabel('Name').fill('some-user');
  await page.getByRole('button', { name: 'Join meeting' }).click({ force: true });

  expect(page.url()).toContain('room/test-room');
  await page.waitForSelector('.publisher', { state: 'visible' });

  await expect(page.getByTestId('MicNoneIcon')).toBeVisible();
  await expect(page.getByTestId('VideoCamIcon')).toBeVisible();
  await expect(page.locator('xpath=//div[contains(text(),"S")]')).toHaveCount(0);

  // Skipping this step for FF as we don't support BG replacement on FF
  // Also, skipping this step for mobile viewport as, currently BG replacement button is not displayed for mobile view ports.
  if (browserName !== 'firefox' && !isMobile) {
    await page.getByTestId('video-dropdown-button').click();

    await expect(page.getByTestId('background-effects-text')).toBeVisible();
  }
});

test('The buttons in the meeting room should match those in the waiting room with disabled buttons', async ({
  page,
  browserName,
  isMobile,
}) => {
  // Click mic button in the video preview area
  await page.getByTestId('video-container-button').first().click();
  await expect(
    page.getByTestId('video-container-button').first().getByTestId('vivid-icon-mic-mute-line')
  ).toBeVisible();

  // Click video button in the video preview area
  await page.getByTestId('video-container-button').nth(1).click();
  await expect(
    page.getByTestId('video-container-button').nth(1).getByTestId('vivid-icon-video-off-line')
  ).toBeVisible();
  await expect(page.getByTestId('PersonIcon')).toBeVisible();

  if (browserName !== 'firefox') {
    await expect(page.getByTestId('portraitIcon')).toBeVisible();
  }
  await page.getByLabel('Name').fill('some user');
  await page.getByRole('button', { name: 'Join meeting' }).click({ force: true });

  expect(page.url()).toContain('room/test-room');
  await page.waitForSelector('.publisher', { state: 'visible' });

  await expect(page.getByTestId('VideoCamOffIcon')).toBeVisible();
  await expect(page.getByTestId('MicOffToolbar')).toBeVisible();

  // Skipping this step for FF as we don't support BG replacement on FF
  // Also, skipping this step for mobile viewport as, currently BG replacement button is not displayed for mobile view ports.
  if (browserName !== 'firefox' && !isMobile) {
    await page.getByTestId('video-dropdown-button').click();

    await expect(page.getByTestId('background-effects-text')).toBeVisible();
  }
});
