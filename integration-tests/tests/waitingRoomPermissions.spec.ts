// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as userNameInputTestIds } from '../../frontend/src/components/WaitingRoom/UserNameInput/testIds';
import {
  chromium,
  expect,
  firefox,
  type Browser,
  type Page,
  type TestInfo,
} from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { waitUntilReady } from './utils';

const ASK_DEVICE_MESSAGE =
  'To join the video room, your browser will request access to your camera and microphone.';
const DENIED_DEVICE_MESSAGE =
  "It seems your browser is blocked from accessing your camera and/or microphone. Reset the permission state through your browser's UI.";
const NETWORK_TEST_SESSION_ERROR = 'Network test session unavailable';
const NETWORK_TEST_SESSION_URL = /\/v2\/createSessionAndJoin/;

test.describe('device access', () => {
  test('should ask for device access while the permission prompt is pending', async ({
    browserName,
    isMobile,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'Firefox does not expose camera and microphone permission states'
    );

    const { browser, page } = await launchWithDevicePermission({
      browserName,
      isMobile,
      testInfo,
      permission: 'prompt',
    });

    await page.goto(`${baseURL}waiting-room/${createRoomName()}`);

    const accessAlert = page.getByRole('dialog');
    await expect(accessAlert).toContainText(ASK_DEVICE_MESSAGE);
    await expect(accessAlert.getByAltText('Access Dialog')).toHaveAttribute(
      'src',
      '/images/access-dialog-pending.png'
    );
    await expect(page.getByTestId('VideoContainerSkeleton')).toBeVisible();
    await expect(page.getByTestId(userNameInputTestIds.joinButton)).toHaveCount(0);

    await browser.close();
  });

  test('should explain that device access is blocked when permissions are denied', async ({
    browserName,
    isMobile,
  }, testInfo) => {
    test.fixme(
      true,
      'VIDSOL-TBD: when camera and microphone are denied the waiting room stays on the loading skeleton and never shows the denied device alert'
    );

    const { browser, page } = await launchWithDevicePermission({
      browserName,
      isMobile,
      testInfo,
      permission: 'denied',
    });

    await page.goto(`${baseURL}waiting-room/${createRoomName()}`);

    const accessAlert = page.getByRole('dialog');
    await expect(accessAlert).toContainText(DENIED_DEVICE_MESSAGE, { timeout: 15_000 });
    await expect(accessAlert.getByAltText('Access Dialog')).toHaveAttribute(
      'src',
      '/images/access-dialog-rejected.png'
    );
    await expect(page.getByTestId('PersonIcon')).toBeVisible();
    await expect(page.getByTestId(userNameInputTestIds.joinButton)).toHaveCount(0);

    await browser.close();
  });
});

test.describe('pre-call network test', () => {
  test('should show an error with a retry button when the test session cannot be created, and retry the test', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'firefox', 'The pre-call network test is not supported in Firefox');
    test.setTimeout(120_000);

    const sessionRequests = await mockNetworkTestSessionFailure(page);
    await openWaitingRoom({ page, browserName });
    await openPrecallNetworkTest(page);

    const dialog = page.getByRole('dialog');
    const retryButton = dialog.getByRole('button', { name: 'Retry test' });
    await expect(dialog.getByText('Test failed')).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText(NETWORK_TEST_SESSION_ERROR)).toBeVisible();
    await expect(retryButton).toBeVisible();
    expect(sessionRequests.count).toBe(1);

    await retryButton.click();

    await expect.poll(() => sessionRequests.count).toBe(2);
    await expect(dialog.getByText('Test failed')).toBeVisible();
    await expect(retryButton).toBeVisible();

    await page.unroute(NETWORK_TEST_SESSION_URL);
    await retryButton.click();

    await expect(dialog.getByRole('progressbar')).toBeVisible();
    await expect(dialog.getByText('Test failed')).toHaveCount(0);
    await expect(dialog.getByText(/^\d+\.\d+\/5$/)).toHaveCount(2, { timeout: 60_000 });
    await expect(retryButton).toBeVisible();
  });

  test('should disable the pre-call network test in unsupported browsers', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'firefox',
      'Only Firefox is reported as unsupported for the pre-call network test'
    );

    await openWaitingRoom({ page, browserName });
    await openMoreOptionsMenu(page);

    const networkTestOption = page
      .getByTestId('menu-more-options')
      .getByRole('menuitem', { name: 'Pre-call network test' });
    await expect(networkTestOption).toHaveAttribute('aria-disabled', 'true');

    await networkTestOption.hover();
    await expect(page.getByText('Your browser does not support this feature')).toBeVisible();

    await networkTestOption.click({ force: true });
    await expect(page.getByText('Test your device access, network connectivity')).toHaveCount(0);
  });
});

function createRoomName(): string {
  return crypto.randomBytes(5).toString('hex');
}

async function launchWithDevicePermission({
  browserName,
  isMobile,
  testInfo,
  permission,
}: {
  browserName: string;
  isMobile: boolean;
  testInfo: TestInfo;
  permission: 'prompt' | 'denied';
}): Promise<{ browser: Browser; page: Page }> {
  const { viewport, userAgent, deviceScaleFactor, hasTouch, launchOptions } = testInfo.project.use;
  const contextOptions = { viewport, userAgent, deviceScaleFactor, hasTouch, isMobile };

  if (browserName === 'firefox') {
    const browser = await firefox.launch({
      ...launchOptions,
      firefoxUserPrefs: {
        ...launchOptions?.firefoxUserPrefs,
        'media.navigator.permission.disabled': false,
        'permissions.default.camera': 2,
        'permissions.default.microphone': 2,
      },
    });
    const page = await (await browser.newContext(contextOptions)).newPage();
    return { browser, page };
  }

  const browser = await chromium.launch({
    ...launchOptions,
    args: (launchOptions?.args ?? []).filter(
      (argument) => argument !== '--use-fake-ui-for-media-stream'
    ),
  });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  if (permission === 'denied') {
    const { targetInfo } = await (await context.newCDPSession(page)).send('Target.getTargetInfo');
    const browserSession = await browser.newBrowserCDPSession();
    for (const name of ['camera', 'microphone']) {
      await browserSession.send('Browser.setPermission', {
        permission: { name },
        setting: 'denied',
        origin: new URL(baseURL).origin,
        browserContextId: targetInfo.browserContextId,
      });
    }
  }

  return { browser, page };
}

async function openWaitingRoom({
  page,
  browserName,
}: {
  page: Page;
  browserName: string;
}): Promise<void> {
  await page.goto(`${baseURL}waiting-room/${createRoomName()}`);
  await waitUntilReady(page, browserName);
  await expect(page.getByTestId(userNameInputTestIds.joinButton)).toBeVisible();
}

async function openMoreOptionsMenu(page: Page): Promise<void> {
  await page
    .locator('button')
    .filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') })
    .click();
  await expect(page.getByTestId('menu-more-options')).toBeVisible();
}

async function openPrecallNetworkTest(page: Page): Promise<void> {
  await openMoreOptionsMenu(page);
  await page.getByTestId('menu-more-options').getByText('Pre-call network test').click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function mockNetworkTestSessionFailure(page: Page): Promise<{ count: number }> {
  const requests = { count: 0 };

  await page.route(NETWORK_TEST_SESSION_URL, async (route) => {
    requests.count++;
    const errorPayload = {
      error: {
        message: NETWORK_TEST_SESSION_ERROR,
        code: -32603,
        data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500, path: 'createSessionAndJoin' },
      },
    };
    const isBatchRequest = new URL(route.request().url()).searchParams.get('batch') === '1';

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify(isBatchRequest ? [errorPayload] : errorPayload),
    });
  });

  return requests;
}
