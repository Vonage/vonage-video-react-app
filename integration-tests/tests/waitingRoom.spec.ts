import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(`${baseURL}waiting-room/test-room`);
  await page.waitForTimeout(1000);
});

test('should navigate back to the welcome page when clicking the Vonage logo', async ({ page }) => {
  // Click the Vonage logo
  await page.getByTestId('banner-logo-image').click();

  // Verify we are redirected to the welcome/landing page (root)
  await page.waitForURL(`${baseURL}`);
  expect(page.url()).toBe(baseURL);
});

test('The buttons in the meeting room should match those in the waiting room with enabled buttons', async ({
  page,
  browserName,
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
  await page.getByTestId('video-dropdown-button').click();

  await expect(page.getByTestId('background-effects-text')).toBeVisible();
});

test('The buttons in the meeting room should match those in the waiting room with disabled buttons', async ({
  page,
  browserName,
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
  await page.getByTestId('video-dropdown-button').click();

  await expect(page.getByTestId('background-effects-text')).toBeVisible();
});

test('should not navigate and should show validation error for invalid usernames', async ({
  page,
}) => {
  // Attempt to join with empty name
  await page.getByRole('button', { name: 'Join meeting' }).click({ force: true });

  expect(page.url()).toContain('waiting-room/test-room');
  await expect(page.getByText('Name cannot be empty or contain special characters.')).toBeVisible();

  // Attempt to join with only special characters
  await page.getByLabel('Name').fill('!!!@@@');
  await page.getByRole('button', { name: 'Join meeting' }).click({ force: true });

  expect(page.url()).toContain('waiting-room/test-room');
  await expect(page.getByText('Name cannot be empty or contain special characters.')).toBeVisible();
});

test('should open device selection menus and show device items', async ({ page, isMobile }) => {
  const controlPanel = page.getByTestId('ControlPanel');

  // Open audio input (Microphone) device menu
  await controlPanel.getByLabel('toggle audio').click();
  const audioInputMenu = page.getByTestId('audioinput-menu');
  await expect(audioInputMenu).toBeVisible();
  // Verify at least one menu item is present (fake devices provide items)
  await expect(audioInputMenu.getByRole('menuitem').first()).toBeVisible();
  // Close the menu
  await page.keyboard.press('Escape');

  // Open video input (Camera) device menu
  await controlPanel.getByLabel('toggle video').click();
  const videoInputMenu = page.getByTestId('videoinput-menu');
  await expect(videoInputMenu).toBeVisible();
  await expect(videoInputMenu.getByRole('menuitem').first()).toBeVisible();
  await page.keyboard.press('Escape');

  // Open audio output (Speakers) device menu
  await controlPanel.getByLabel('Speakers').click();
  const audioOutputMenu = page.getByTestId('audiooutput-menu');
  await expect(audioOutputMenu).toBeVisible();
  await expect(audioOutputMenu.getByText('Test speakers')).toBeVisible();
  // On mobile/Android, device selection is not supported but test speaker button is shown
  if (!isMobile) {
    await expect(audioOutputMenu.getByRole('menuitem').first()).toBeVisible();
  }
});

test('should show all items in the More Options menu', async ({ page }) => {
  // Click the more options button (⋮ icon)
  const moreOptionsButton = page
    .locator('button')
    .filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') });
  await moreOptionsButton.click();

  // Verify menu is visible
  await expect(page.getByTestId('menu-more-options')).toBeVisible();

  // Advanced settings is conditionally rendered based on env config
  const advancedSettingsOption = page.getByTestId('advanced-settings-option');
  if ((await advancedSettingsOption.count()) > 0) {
    await expect(advancedSettingsOption).toBeVisible();
  }

  await expect(page.getByText('Pre-call network test')).toBeVisible();
});

test('should display the correct room name in the waiting room', async ({ page }) => {
  // The beforeEach navigates to waiting-room/test-room
  // Verify the room name is displayed in the username input panel
  await expect(page.getByText('test-room')).toBeVisible();
});

test('should render the video preview element after page load', async ({ page }) => {
  // Verify the video container is present
  await expect(page.locator('[data-video-container]')).toBeVisible();

  // Verify the video element is rendered inside
  await page.waitForSelector('.video__element', { state: 'attached', timeout: 10000 });
  await expect(page.locator('.video__element')).toBeAttached();
});

test('should run Pre-call Network Test end-to-end: progress, stop, retry, and results', async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);

  // Pre-call network test requires media processor support (not supported in Firefox)
  if (browserName === 'firefox') {
    return;
  }

  // Open More Options menu
  const moreOptionsButton = page
    .locator('button')
    .filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') });
  await moreOptionsButton.click();
  await expect(page.getByTestId('menu-more-options')).toBeVisible();

  // Click Pre-call network test option
  await page.getByTestId('menu-more-options').getByText('Pre-call network test').click();

  // Verify dialog opens with the correct title and subtitle
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Pre-call network test')).toBeVisible();
  await expect(
    dialog.getByText(
      'Test your device access, network connectivity and call quality before joining'
    )
  ).toBeVisible();

  // Verify CircularProgress indicator is shown while testing
  await expect(page.locator('[role="progressbar"]')).toBeVisible();

  // Stop the test and verify stopped state
  await page.getByRole('button', { name: 'Stop test' }).click();
  await expect(dialog.getByText('Test stopped')).toBeVisible();
  await expect(
    dialog.getByText("You stopped the network test. You can retry when you're ready.")
  ).toBeVisible();

  // Retry the test
  await page.getByRole('button', { name: 'Retry test' }).click();
  await expect(page.locator('[role="progressbar"]')).toBeVisible();

  // Wait for the test to complete and show results (scores are displayed as X.XX/5)
  await expect(dialog.getByText(/\d+\.\d+\/5/).first()).toBeVisible({ timeout: 60000 });

  // Verify Audio and Video quality rows are displayed
  await expect(dialog.getByText('Audio')).toBeVisible();
  await expect(dialog.getByText('Video')).toBeVisible();

  // Verify Quality labels are shown
  await expect(dialog.getByText('Quality:').first()).toBeVisible();

  // Verify both scores are present (format: X.XX/5)
  const scoreElements = dialog.getByText(/^\d+\.\d+\/5$/);
  await expect(scoreElements).toHaveCount(2);

  // Verify Retry test button appears after completion
  await expect(page.getByRole('button', { name: 'Retry test' })).toBeVisible();
});

test('should show PersonIcon avatar with correct initials when video is disabled', async ({
  page,
}) => {
  // Disable video by clicking the camera button
  await page.getByTestId('video-container-button').nth(1).click();
  await expect(
    page.getByTestId('video-container-button').nth(1).getByTestId('vivid-icon-video-off-line')
  ).toBeVisible();

  // Verify the PersonIcon avatar appears
  await expect(page.getByTestId('PersonIcon')).toBeVisible();

  // Enter a single word name and verify a single initial is shown
  await page.getByLabel('Name').fill('Alice');
  await expect(page.getByTestId('PersonIcon')).toHaveText('A');

  // Enter a two word name and verify both initials are shown
  await page.getByLabel('Name').fill('John Doe');
  await expect(page.getByTestId('PersonIcon')).toHaveText('JD');
});

test('should carry username and initials to the meeting room publisher tile', async ({ page }) => {
  // Disable video so initials are visible on the publisher tile
  await page.getByTestId('video-container-button').nth(1).click();
  await expect(
    page.getByTestId('video-container-button').nth(1).getByTestId('vivid-icon-video-off-line')
  ).toBeVisible();

  // Enter a two-word name
  await page.getByLabel('Name').fill('John Doe');
  await expect(page.getByTestId('PersonIcon')).toHaveText('JD');

  // Join the meeting room
  await page.getByRole('button', { name: 'Join meeting' }).click({ force: true });
  expect(page.url()).toContain('room/test-room');
  await page.waitForSelector('.publisher', { state: 'visible' });

  // Verify the name is displayed on the publisher tile
  await expect(page.getByTestId('publisher-container').getByText('John Doe')).toBeVisible();

  // Verify the initials are displayed on the publisher tile (video is off)
  await expect(page.getByTestId('publisher-container').getByText('JD')).toBeVisible();
});
