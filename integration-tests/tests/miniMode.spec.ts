import { expect, Page } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';

const joinMeeting = async (
  page: Page,
  roomName: string,
  username: string,
  browserName?: string
) => {
  await page.goto(`${baseURL}waiting-room/${roomName}`);
  await page.waitForTimeout(browserName === 'firefox' ? 3000 : 1000);
  await page.getByLabel('Name').fill(username);
  await page.getByRole('button', { name: 'Join meeting' }).click({ force: true });
};

test.describe('Mini Mode', () => {
  test('Chrome: Mini mode button opens a Document Picture-in-Picture window', async ({
    page,
    browserName,
    isMobile,
  }) => {
    test.skip(browserName !== 'chromium', 'Document PiP is Chromium-only');
    test.skip(!!isMobile, 'Mini Mode v1 is desktop toolbar');

    await joinMeeting(page, randomBytes(5).toString('hex'), 'Mini Chrome', browserName);

    await expect(page.getByTestId('meetingRoom')).toBeVisible({ timeout: 30_000 });
    const miniButton = page.getByTestId('mini-mode-button');
    await expect(miniButton).toBeVisible();

    const supported = await page.evaluate(
      () => typeof window.documentPictureInPicture?.requestWindow === 'function'
    );
    expect(supported).toBe(true);

    await miniButton.click({ force: true });

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const pipWindow = (
            window as Window & {
              documentPictureInPicture?: { window?: Window | null };
            }
          ).documentPictureInPicture?.window;
          return Boolean(pipWindow && !pipWindow.closed);
        })
      )
      .toBe(true);

    const pipHasChrome = await page.evaluate(() => {
      const pipDoc = (
        window as Window & {
          documentPictureInPicture?: { window?: Window | null };
        }
      ).documentPictureInPicture?.window?.document;
      return Boolean(pipDoc?.querySelector('[data-testid="mini-call-window"]'));
    });
    expect(pipHasChrome).toBe(true);
  });

  test('Firefox and Safari: Mini mode button is hidden', async ({
    page,
    browserName,
    isMobile,
  }) => {
    test.skip(browserName === 'chromium', 'Chromium supports Mini Mode');
    test.skip(!!isMobile, 'Mini Mode v1 is desktop toolbar');

    await joinMeeting(page, randomBytes(5).toString('hex'), `Mini ${browserName}`, browserName);

    await expect(page.getByTestId('meetingRoom')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mini-mode-button')).toHaveCount(0);

    const supported = await page.evaluate(
      () => typeof window.documentPictureInPicture?.requestWindow === 'function'
    );
    expect(supported).toBe(false);
  });
});
