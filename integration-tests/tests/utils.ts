import { Page, expect } from '@playwright/test';
import { baseURL } from '../fixtures/testWithLogging';

const devicesStoreKey = 'vera-devices-store';

type PersistedDeviceSelection = {
  audioinput?: string;
  audiooutput?: string;
  videoinput?: string;
};

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

export const primeMediaDevices = async ({ page }: { page: Page }) => {
  const hasPersistedDeviceSelection = await page.evaluate((key) => {
    const storedSelection = localStorage.getItem(key);

    if (!storedSelection) {
      return false;
    }

    const persistedDeviceSelection = JSON.parse(storedSelection) as PersistedDeviceSelection;

    return Boolean(persistedDeviceSelection.audioinput && persistedDeviceSelection.videoinput);
  }, devicesStoreKey);

  if (hasPersistedDeviceSelection) {
    return;
  }

  await page.waitForFunction(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const hasAudioInput = devices.some(
      (device) => device.kind === 'audioinput' && Boolean(device.deviceId)
    );
    const hasVideoInput = devices.some(
      (device) => device.kind === 'videoinput' && Boolean(device.deviceId)
    );

    return hasAudioInput && hasVideoInput;
  });

  const persistedDeviceSelection = await page.evaluate(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const pickDeviceId = (kind: MediaDeviceKind) => {
      return devices.find((device) => device.kind === kind && device.deviceId)?.deviceId;
    };

    return {
      audioinput: pickDeviceId('audioinput'),
      audiooutput: pickDeviceId('audiooutput'),
      videoinput: pickDeviceId('videoinput'),
    };
  });

  await page.evaluate(
    ({ key, persistedDeviceSelection }) => {
      const storedSelection = localStorage.getItem(key);
      const previousSelection = storedSelection
        ? (JSON.parse(storedSelection) as PersistedDeviceSelection)
        : {};

      localStorage.setItem(
        key,
        JSON.stringify({
          ...previousSelection,
          ...persistedDeviceSelection,
        })
      );
    },
    { key: devicesStoreKey, persistedDeviceSelection }
  );

  await page.reload({ waitUntil: 'networkidle' });
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

  await primeMediaDevices({ page });

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
