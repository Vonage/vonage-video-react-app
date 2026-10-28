import { expect, type Locator, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

const MAX_SUBSCRIBER_TILES_ACTIVE_SPEAKER_DESKTOP = 5;
const MAX_SUBSCRIBER_TILES_ACTIVE_SPEAKER_MOBILE = 2;
const REMOTE_PARTICIPANT_NAMES = [
  'Bob Brown',
  'Carol Clark',
  'Dave Davis',
  'Erin Evans',
  'Frank Foster',
  'Grace Green',
];

test.describe('zoom controls on a screenshare tile', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'screenshare and zoom are only supported on chrome desktop'
  );

  test('should zoom in, zoom out and reset the zoom of a screenshare subscriber', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    const roomName = createRoomName();

    await joinMeetingRoom({ page: pageOne, username: 'User One', roomName, browserName });

    const pageTwo = await context.newPage();
    await joinMeetingRoom({ page: pageTwo, username: 'User Two', roomName, browserName });
    await pageTwo.waitForSelector('.subscriber', { state: 'visible' });

    await pageOne.getByTestId('ScreenShareIcon').click();
    await pageTwo.waitForSelector('.screen-subscriber', { state: 'visible' });

    const screenshareTile = pageTwo.locator('.screen-subscriber');
    const zoomedContent = screenshareTile.locator('xpath=./div[1]');
    const zoomIndicatorButton = screenshareTile.getByTestId('zoom-indicator-button');
    const zoomLevel = screenshareTile.getByTestId('zoom-level');
    const zoomInButton = screenshareTile.getByTestId('zoom-in-button');
    const zoomOutButton = screenshareTile.getByTestId('zoom-out-button');

    await expect(zoomIndicatorButton).toBeVisible();
    await expect(zoomLevel).toHaveCount(0);

    await zoomIndicatorButton.click();
    await expect(zoomLevel).toHaveText('125%');
    await expect(zoomedContent).toHaveCSS('transform', 'matrix(1.25, 0, 0, 1.25, 0, 0)');

    await zoomInButton.click();
    await expect(zoomLevel).toHaveText('150%');
    await expect(zoomedContent).toHaveCSS('transform', 'matrix(1.5, 0, 0, 1.5, 0, 0)');

    await zoomOutButton.click();
    await expect(zoomLevel).toHaveText('125%');

    for (let step = 0; step < 15; step++) {
      await zoomInButton.click();
    }
    await expect(zoomLevel).toHaveText('500%');
    await expect(zoomInButton).toBeDisabled();

    await zoomIndicatorButton.click();
    await expect(zoomLevel).toHaveCount(0);
    await expect(zoomInButton).toHaveCount(0);
    await expect(zoomOutButton).toHaveCount(0);
    await expect(zoomedContent).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  });
});

test.describe('self-view mirroring', () => {
  test('should mirror the self view by default and follow the advanced setting toggle', async ({
    page,
    browserName,
  }) => {
    const roomName = createRoomName();

    await page.goto(`${baseURL}waiting-room/${roomName}`);
    await waitUntilReady(page, browserName);

    const previewVideo = page.locator('[data-video-container] > *').first();
    await expect(previewVideo).toBeVisible();
    await expect.poll(() => isMirrored(previewVideo)).toBe(true);

    await openWaitingRoomAdvancedSettingsVideoTab(page);
    const mirroringSwitch = page.getByTestId('advanced-settings-video-self-view-mirroring');
    await expect(mirroringSwitch).toBeChecked();
    await mirroringSwitch.uncheck();
    await expect(mirroringSwitch).not.toBeChecked();
    await closeAdvancedSettings(page);

    await expect.poll(() => isMirrored(previewVideo)).toBe(false);

    await page.getByLabel('Name').fill('Mirror User');
    await page.getByRole('button', { name: 'Join meeting' }).click();
    await page.waitForSelector('.publisher', { state: 'visible' });

    const publisherVideo = page.locator('.publisher .video__element');
    await expect(publisherVideo).toHaveCSS('transform', 'none');

    await openMeetingRoomAdvancedSettingsVideoTab(page);
    await expect(mirroringSwitch).not.toBeChecked();
    await mirroringSwitch.check();
    await expect(mirroringSwitch).toBeChecked();
    await closeAdvancedSettings(page);

    await expect(publisherVideo).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  });
});

test.describe('video stats overlay', () => {
  test('should show live video stats on the waiting room preview when enabled', async ({
    page,
    browserName,
  }) => {
    await page.goto(`${baseURL}waiting-room/${createRoomName()}`);
    await waitUntilReady(page, browserName);

    const statsOverlay = page.getByTestId('video-stats-overlay');
    await openWaitingRoomAdvancedSettingsVideoTab(page);
    const statsOverlaySwitch = page.getByTestId('advanced-settings-video-stats-overlay');
    await statsOverlaySwitch.uncheck();
    await closeAdvancedSettings(page);
    await expect(statsOverlay).toHaveCount(0);

    await openWaitingRoomAdvancedSettingsVideoTab(page);
    await statsOverlaySwitch.check();
    await expect(statsOverlaySwitch).toBeChecked();
    await closeAdvancedSettings(page);

    await expect(statsOverlay).toBeVisible();
    await expect(statsOverlay).toHaveText(/^\d+p \d+fps$/, { timeout: 10000 });

    await page.getByTestId('video-container-button').nth(1).click();
    await expect(page.getByTestId('vivid-icon-video-off-line')).toBeVisible();
    await expect(statsOverlay).toHaveCount(0);

    await page.getByTestId('video-container-button').nth(1).click();
    await expect(statsOverlay).toBeVisible();

    await openWaitingRoomAdvancedSettingsVideoTab(page);
    await statsOverlaySwitch.uncheck();
    await expect(statsOverlaySwitch).not.toBeChecked();
    await closeAdvancedSettings(page);

    await expect(statsOverlay).toHaveCount(0);
  });
});

test.describe('push-to-talk', () => {
  test.skip(({ isMobile }) => isMobile, 'push-to-talk requires a physical keyboard');

  test('should unmute while Space is held and mute again on release', async ({
    page,
    browserName,
  }) => {
    await joinMeetingRoom({
      page,
      username: 'Talker',
      roomName: createRoomName(),
      browserName,
      audioOff: true,
    });

    await expect(page.getByTestId('MicOffToolbar')).toBeVisible();
    await blurActiveElement(page);

    await page.keyboard.down('Space');
    await expect(page.getByTestId('MicNoneIcon')).toBeVisible();
    await expect(page.getByTestId('MicOffToolbar')).toHaveCount(0);

    await page.keyboard.up('Space');
    await expect(page.getByTestId('MicOffToolbar')).toBeVisible();
    await expect(page.getByTestId('MicNoneIcon')).toHaveCount(0);
  });

  test('should keep the microphone unmuted when Space is pressed while already unmuted', async ({
    page,
    browserName,
  }) => {
    await joinMeetingRoom({ page, username: 'Talker', roomName: createRoomName(), browserName });

    await expect(page.getByTestId('MicNoneIcon')).toBeVisible();
    await blurActiveElement(page);

    await page.keyboard.down('Space');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('MicNoneIcon')).toBeVisible();

    await page.keyboard.up('Space');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('MicNoneIcon')).toBeVisible();
    await expect(page.getByTestId('MicOffToolbar')).toHaveCount(0);
  });

  test('should ignore Space while typing in the chat input', async ({ page, browserName }) => {
    await joinMeetingRoom({
      page,
      username: 'Talker',
      roomName: createRoomName(),
      browserName,
      audioOff: true,
    });

    await page.getByTestId('ChatIcon').click();
    const chatInput = page.getByPlaceholder('Send a message');
    await chatInput.click();

    await page.keyboard.down('Space');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('MicOffToolbar')).toBeVisible();
    await page.keyboard.up('Space');

    await expect(chatInput).toHaveValue(' ');
    await expect(page.getByTestId('MicOffToolbar')).toBeVisible();
  });
});

test.describe('hidden participants tile', () => {
  test('should group overflowing participants and promote a hidden active speaker', async ({
    page: pageOne,
    context,
    browserName,
    isMobile,
  }) => {
    test.setTimeout(180_000);

    const roomName = createRoomName();
    const maxSubscriberTiles = isMobile
      ? MAX_SUBSCRIBER_TILES_ACTIVE_SPEAKER_MOBILE
      : MAX_SUBSCRIBER_TILES_ACTIVE_SPEAKER_DESKTOP;
    const remoteParticipantNames = REMOTE_PARTICIPANT_NAMES.slice(0, maxSubscriberTiles + 1);
    const expectedHiddenCount = remoteParticipantNames.length - (maxSubscriberTiles - 1);

    await joinMeetingRoom({
      page: pageOne,
      username: 'Alice Adams',
      roomName,
      browserName,
      audioOff: true,
    });

    const remotePages = new Map<string, Page>();
    for (const username of remoteParticipantNames) {
      const remotePage = await context.newPage();
      await joinMeetingRoom({
        page: remotePage,
        username,
        roomName,
        browserName,
        audioOff: true,
        videoOff: true,
      });
      remotePages.set(username, remotePage);
    }

    const hiddenParticipantsTile = pageOne.getByTestId('hidden-participants');
    await expect(hiddenParticipantsTile).toBeVisible({ timeout: 20000 });
    await expect(hiddenParticipantsTile.locator('.MuiAvatar-root')).toHaveCount(
      expectedHiddenCount
    );

    const visibleSubscribers = pageOne.locator('.subscriber:visible');
    await expect(visibleSubscribers).toHaveCount(maxSubscriberTiles - 1);

    const hiddenParticipantNames = await getHiddenParticipantNames({
      page: pageOne,
      participantNames: remoteParticipantNames,
    });
    expect(hiddenParticipantNames).toHaveLength(expectedHiddenCount);

    await hiddenParticipantsTile.click();
    await expect(pageOne.getByTestId('right-panel-title')).toBeVisible();
    for (const username of remoteParticipantNames) {
      await expect(
        pageOne.locator('[data-testid^="participant-list-item"]', { hasText: username })
      ).toBeVisible();
    }
    await pageOne.getByTestId('right-panel-title').getByTestId('CloseIcon').click();

    const promotedParticipantName = hiddenParticipantNames[0];
    await remotePages.get(promotedParticipantName).getByTestId('MicOffToolbar').click();

    await expect(
      visibleSubscribers.getByText(promotedParticipantName, { exact: true })
    ).toBeVisible({ timeout: 20000 });
    await expect(hiddenParticipantsTile).toBeVisible();
  });
});

function createRoomName(): string {
  return crypto.randomBytes(5).toString('hex');
}

async function joinMeetingRoom({
  page,
  username,
  roomName,
  browserName,
  audioOff = false,
  videoOff = false,
}: {
  page: Page;
  username: string;
  roomName: string;
  browserName: string;
  audioOff?: boolean;
  videoOff?: boolean;
}): Promise<void> {
  await openMeetingRoomWithSettings({ page, username, roomName, browserName, audioOff, videoOff });
  await page.waitForSelector('.publisher', { state: 'visible' });
}

async function openWaitingRoomAdvancedSettingsVideoTab(page: Page): Promise<void> {
  await page
    .locator('button')
    .filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') })
    .click();
  await expect(page.getByTestId('menu-more-options')).toBeVisible();

  const advancedSettingsOption = page.getByTestId('advanced-settings-option');
  test.skip(
    (await advancedSettingsOption.count()) === 0,
    'Advanced settings are disabled in the waiting room'
  );

  await advancedSettingsOption.click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();
  await page.getByTestId('advanced-settings-tab-video').click();
}

async function openMeetingRoomAdvancedSettingsVideoTab(page: Page): Promise<void> {
  const visibleAdvancedSettingsButton = page.locator(
    '[data-testid="advanced-settings-button"]:visible'
  );

  const isButtonInToolbar = (await visibleAdvancedSettingsButton.count()) > 0;
  if (!isButtonInToolbar) {
    await page.getByTestId('hidden-toolbar-items').click();
  }

  test.skip(
    (await visibleAdvancedSettingsButton.count()) === 0,
    'Advanced settings are disabled in the meeting room'
  );

  await visibleAdvancedSettingsButton.first().click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();
  await page.getByTestId('advanced-settings-tab-video').click();
}

async function closeAdvancedSettings(page: Page): Promise<void> {
  await page.getByTestId('advanced-settings-dialog').getByRole('button', { name: 'Close' }).click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeHidden();
}

async function isMirrored(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const { transform, scale } = getComputedStyle(element);
    const isTransformMirrored = transform.startsWith('matrix(-');
    const isScaleMirrored = (scale ?? '').trim().startsWith('-');
    return isTransformMirrored || isScaleMirrored;
  });
}

async function blurActiveElement(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

async function getHiddenParticipantNames({
  page,
  participantNames,
}: {
  page: Page;
  participantNames: string[];
}): Promise<string[]> {
  const visibilityByName = await Promise.all(
    participantNames.map(async (username) => ({
      username,
      isVisible:
        (await page.locator('.subscriber:visible').getByText(username, { exact: true }).count()) >
        0,
    }))
  );

  return visibilityByName.filter(({ isVisible }) => !isVisible).map(({ username }) => username);
}
