// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as userNameInputTestIds } from '../../frontend/src/components/WaitingRoom/UserNameInput/testIds';
import { expect, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test as baseTest, baseURL } from '../fixtures/testWithLogging';

type DevicePermission = 'prompt' | 'denied';

const ASK_DEVICE_MESSAGE =
  'To join the video room, your browser will request access to your camera and microphone.';
const DENIED_DEVICE_MESSAGE =
  "It seems your browser is blocked from accessing your camera and/or microphone. Reset the permission state through your browser's UI.";
const FAKE_MEDIA_UI_FLAG = '--use-fake-ui-for-media-stream';
const FIREFOX_PERMISSION_DENIED = 2;

const test = baseTest.extend<{ devicePermission: DevicePermission }>({
  devicePermission: ['prompt', { option: true }],

  launchOptions: [
    async ({ launchOptions, browserName }, use) => {
      if (browserName === 'chromium') {
        await use({
          ...launchOptions,
          args: (launchOptions.args ?? []).filter((argument) => argument !== FAKE_MEDIA_UI_FLAG),
        });
        return;
      }

      if (browserName === 'firefox') {
        await use({
          ...launchOptions,
          firefoxUserPrefs: {
            ...launchOptions.firefoxUserPrefs,
            'media.navigator.permission.disabled': false,
            'permissions.default.camera': FIREFOX_PERMISSION_DENIED,
            'permissions.default.microphone': FIREFOX_PERMISSION_DENIED,
          },
        });
        return;
      }

      throw new Error(`Device permission tests do not support the ${browserName} browser`);
    },
    { scope: 'worker' },
  ],

  context: async ({ context, browser, browserName, devicePermission }, use) => {
    if (browserName === 'firefox' && devicePermission !== 'denied') {
      throw new Error('Firefox is launched with denied device permissions only');
    }

    const shouldDenyInChromium = browserName === 'chromium' && devicePermission === 'denied';
    if (shouldDenyInChromium) {
      const targetPage = await context.newPage();
      const { targetInfo } = await (
        await context.newCDPSession(targetPage)
      ).send('Target.getTargetInfo');
      await targetPage.close();

      const browserSession = await browser.newBrowserCDPSession();
      for (const name of ['camera', 'microphone']) {
        await browserSession.send('Browser.setPermission', {
          permission: { name },
          setting: 'denied',
          origin: new URL(baseURL).origin,
          browserContextId: targetInfo.browserContextId,
        });
      }

      // Chromium drops Browser.setPermission overrides when the CDP session that set them detaches.
      await use(context);
      await browserSession.detach();
      return;
    }

    await use(context);
  },
});

test.describe('device access', () => {
  test.skip(
    ({ browserName }) => browserName === 'webkit',
    'DeviceAccessAlert is not rendered on WebKit'
  );

  test.describe('pending permission', () => {
    test.use({ devicePermission: 'prompt' });
    test.skip(
      ({ browserName }) => browserName === 'firefox',
      'Firefox does not expose camera and microphone permission states'
    );

    test('should ask for device access while the permission prompt is pending', async ({
      page,
    }) => {
      await page.goto(`${baseURL}waiting-room/${createRoomName()}`);

      const accessAlert = page.getByRole('dialog');
      await expect(accessAlert).toContainText(ASK_DEVICE_MESSAGE);
      await expect(accessAlert.getByAltText('Access Dialog')).toHaveAttribute(
        'src',
        '/images/access-dialog-pending.png'
      );
      await expect(page.getByTestId('VideoContainerSkeleton')).toBeVisible();
    });
  });

  test.describe('denied permission', () => {
    test.use({ devicePermission: 'denied' });

    test('should explain that device access is blocked when permissions are denied', async ({
      page,
      browserName,
    }) => {
      await page.goto(`${baseURL}waiting-room/${createRoomName()}`);

      await expect.poll(() => readDeviceAccessState({ page, browserName })).toBe('denied');

      const accessAlert = page.getByRole('dialog');
      await expect(accessAlert).toContainText(DENIED_DEVICE_MESSAGE, { timeout: 15_000 });
      await expect(accessAlert.getByAltText('Access Dialog')).toHaveAttribute(
        'src',
        '/images/access-dialog-rejected.png'
      );
      await expect(page.getByTestId('VideoContainerSkeleton')).toBeVisible();
      await expect(page.getByTestId('PersonIcon')).toBeVisible();
      await expect(page.getByTestId(userNameInputTestIds.joinButton)).toHaveCount(0);
    });
  });
});

function createRoomName(): string {
  return crypto.randomBytes(5).toString('hex');
}

async function readDeviceAccessState({
  page,
  browserName,
}: {
  page: Page;
  browserName: string;
}): Promise<string> {
  if (browserName === 'chromium') {
    return page.evaluate(async () => {
      const states = await Promise.all(
        ['camera', 'microphone'].map((name) =>
          navigator.permissions.query({ name: name as PermissionName }).then(({ state }) => state)
        )
      );
      return states.every((state) => state === 'denied') ? 'denied' : states.join(',');
    });
  }

  return page.evaluate(() =>
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
      (stream) => {
        stream.getTracks().forEach((track) => track.stop());
        return 'granted';
      },
      (error: Error) => (error.name === 'NotAllowedError' ? 'denied' : error.name)
    )
  );
}
