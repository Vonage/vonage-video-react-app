import { expect, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test as testWithLogging, baseURL, addLogger } from '../fixtures/testWithLogging';
import {
  closeAdvancedSettings,
  openMeetingRoomAdvancedSettings,
  openWaitingRoomAdvancedSettings,
  waitUntilReady,
} from './utils';

const SCREEN_SHARE_DEFAULT_OPTION = 'default-sdk';

const test = testWithLogging.extend<{ pageWithPersistentStorage: Page }>({
  pageWithPersistentStorage: async ({ browser }, use) => {
    const persistentContext = await browser.newContext();
    const page = addLogger(await persistentContext.newPage(), persistentContext);
    await use(page);
    await persistentContext.close();
  },
});

test.describe('advanced settings applied to the camera', () => {
  test('should publish the camera with the resolution and frame rate chosen in the waiting room', async ({
    page,
    browserName,
  }) => {
    await openWaitingRoom({ page, browserName });

    await openWaitingRoomAdvancedSettings({ page, tab: 'video' });
    await page.getByTestId('advanced-settings-video-camera-resolution').selectOption('640x480');
    await page.getByTestId('advanced-settings-video-camera-frame-rate').selectOption('15');
    await closeAdvancedSettings(page);

    await page.getByLabel('Name').fill('Settings User');
    await page.getByRole('button', { name: 'Join meeting' }).click();
    await expect(page.locator('.publisher')).toBeVisible();

    await expect
      .poll(() => readPublisherVideoTrack(page), { timeout: 15_000 })
      .toMatchObject({ requestedWidth: 640, requestedHeight: 480, requestedFrameRate: 15 });

    // Firefox's fake camera reports 1920x1080 at 30fps from getSettings() even with these constraints.
    if (browserName !== 'chromium') return;

    await expect
      .poll(() => readPublisherVideoTrack(page), { timeout: 15_000 })
      .toMatchObject({ width: 640, height: 480, frameRate: 15 });
  });
});

test.describe('advanced settings dialog', () => {
  test('should keep codec, content hint, scalable screenshare and screen share bitrate and frame rate after reopening', async ({
    page,
    browserName,
  }) => {
    await openWaitingRoom({ page, browserName });

    await openWaitingRoomAdvancedSettings({ page, tab: 'video' });
    const cameraCodec = page.getByTestId('advanced-settings-video-camera-codec');
    await expect(cameraCodec).toHaveValue('automatic');
    await cameraCodec.selectOption('manual');

    await page.getByTestId('advanced-settings-tab-screenSharing').click();
    const screenShareCodec = page.getByTestId('advanced-settings-video-screen-share-codec');
    const screenShareContentHint = page.getByTestId(
      'advanced-settings-video-screen-share-content-hint'
    );
    const screenShareFrameRate = page.getByTestId(
      'advanced-settings-video-screen-share-frame-rate'
    );
    const screenShareBitrate = page.getByTestId('advanced-settings-video-screen-share-bitrate');
    const scalableScreenshare = page.getByTestId('advanced-settings-video-scalable-screenshare');
    await expect(screenShareCodec).toHaveValue('inherit');
    await expect(screenShareContentHint).toHaveValue('detail');
    await expect(screenShareFrameRate).toHaveValue(SCREEN_SHARE_DEFAULT_OPTION);
    await expect(screenShareBitrate).toHaveValue(SCREEN_SHARE_DEFAULT_OPTION);
    await expect(scalableScreenshare).not.toBeChecked();
    await screenShareCodec.selectOption('automatic');
    await screenShareContentHint.selectOption('text');
    await screenShareFrameRate.selectOption('15');
    await screenShareBitrate.selectOption('bw_saver');
    await scalableScreenshare.check();

    await closeAdvancedSettings(page);
    await openWaitingRoomAdvancedSettings({ page, tab: 'video' });

    await expect(cameraCodec).toHaveValue('manual');

    await page.getByTestId('advanced-settings-tab-screenSharing').click();
    await expect(screenShareCodec).toHaveValue('automatic');
    await expect(screenShareContentHint).toHaveValue('text');
    await expect(screenShareFrameRate).toHaveValue('15');
    await expect(screenShareBitrate).toHaveValue('bw_saver');
    await expect(scalableScreenshare).toBeChecked();
  });

  test('should keep the camera content hint after reopening', async ({ page, browserName }) => {
    test.skip(
      browserName === 'firefox',
      'Firefox does not support MediaStreamTrack.contentHint, so the camera content hint cannot be applied'
    );

    await openWaitingRoom({ page, browserName });

    await openWaitingRoomAdvancedSettings({ page, tab: 'video' });
    const cameraContentHint = page.getByTestId('advanced-settings-video-camera-content-hint');
    await expect(cameraContentHint).toHaveValue('');
    await cameraContentHint.selectOption('motion');

    await closeAdvancedSettings(page);
    await openWaitingRoomAdvancedSettings({ page, tab: 'video' });

    await expect(cameraContentHint).toHaveValue('motion');
  });
});

test.describe('advanced settings storage', () => {
  test('should restore the saved settings from storage after reloading the meeting room', async ({
    pageWithPersistentStorage: page,
    browserName,
  }) => {
    await openWaitingRoom({ page, browserName });

    await openWaitingRoomAdvancedSettings({ page, tab: 'video' });
    await page.getByTestId('advanced-settings-video-camera-resolution').selectOption('640x480');
    await page.getByTestId('advanced-settings-video-camera-frame-rate').selectOption('15');
    await page.getByTestId('advanced-settings-video-camera-bitrate').selectOption('bw_saver');
    await page.getByTestId('advanced-settings-video-camera-codec').selectOption('manual');
    await page.getByTestId('advanced-settings-video-self-view-mirroring').uncheck();
    await page.getByTestId('advanced-settings-tab-screenSharing').click();
    await page
      .getByTestId('advanced-settings-video-screen-share-content-hint')
      .selectOption('motion');
    await closeAdvancedSettings(page);

    await page.getByLabel('Name').fill('Reload User');
    await page.getByRole('button', { name: 'Join meeting' }).click();
    await expect(page.locator('.publisher')).toBeVisible();
    await expect(page).toHaveURL(/\/room\//);

    // A reload loses the router's hasAccess state and RedirectToWaitingRoom sends the page back to the waiting room.
    const roomUrl = new URL(page.url());
    roomUrl.searchParams.set('bypass', 'true');
    await page.goto(roomUrl.toString());
    await waitUntilReady(page, browserName);
    await expect(page).toHaveURL(/\/room\//);
    await expect(page.locator('.publisher')).toBeVisible();

    await openMeetingRoomAdvancedSettings({ page, tab: 'video' });
    await expect(page.getByTestId('advanced-settings-video-camera-resolution')).toHaveValue(
      '640x480'
    );
    await expect(page.getByTestId('advanced-settings-video-camera-frame-rate')).toHaveValue('15');
    await expect(page.getByTestId('advanced-settings-video-camera-bitrate')).toHaveValue(
      'bw_saver'
    );
    await expect(page.getByTestId('advanced-settings-video-camera-codec')).toHaveValue('manual');
    await expect(page.getByTestId('advanced-settings-video-self-view-mirroring')).not.toBeChecked();

    await page.getByTestId('advanced-settings-tab-screenSharing').click();
    await expect(page.getByTestId('advanced-settings-video-screen-share-content-hint')).toHaveValue(
      'motion'
    );
  });
});

async function openWaitingRoom({
  page,
  browserName,
}: {
  page: Page;
  browserName: string;
}): Promise<void> {
  await page.goto(`${baseURL}waiting-room/${crypto.randomBytes(5).toString('hex')}`);
  await waitUntilReady(page, browserName);
  await expect(page.locator('[data-video-container] video')).toBeVisible();
}

type PublisherVideoTrack = {
  width?: number;
  height?: number;
  frameRate?: number;
  requestedWidth?: number;
  requestedHeight?: number;
  requestedFrameRate?: number;
};

async function readPublisherVideoTrack(page: Page): Promise<PublisherVideoTrack | null> {
  return page.evaluate(() => {
    const videoElement = document.querySelector<HTMLVideoElement>('.publisher video');
    const videoTrack = (videoElement?.srcObject as MediaStream | null)?.getVideoTracks()[0];
    if (!videoTrack) return null;

    const toRequestedNumber = (constraint: ConstrainULong | ConstrainDouble | undefined) => {
      if (typeof constraint === 'number') return constraint;
      return constraint?.exact ?? constraint?.ideal;
    };

    const { width, height, frameRate } = videoTrack.getSettings();
    const constraints = videoTrack.getConstraints();
    return {
      width,
      height,
      frameRate: frameRate === undefined ? undefined : Math.round(frameRate),
      requestedWidth: toRequestedNumber(constraints.width),
      requestedHeight: toRequestedNumber(constraints.height),
      requestedFrameRate: toRequestedNumber(constraints.frameRate),
    };
  });
}
