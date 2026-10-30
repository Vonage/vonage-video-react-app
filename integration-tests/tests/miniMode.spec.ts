import { expect, Page } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';

type PictureInPictureCapableWindow = Window & {
  documentPictureInPicture?: { window?: Window | null };
};

const joinMeeting = async (page: Page, username: string) => {
  await page.goto(`${baseURL}waiting-room/${randomBytes(5).toString('hex')}`);
  await page.getByLabel('Name').waitFor({ state: 'visible' });
  await page.getByLabel('Name').fill(username);
  await page.getByRole('button', { name: 'Join meeting' }).click();
  await expect(page.getByTestId('meetingRoom')).toBeVisible({ timeout: 30_000 });
};

const isDesktopChromium = (browserName: string, isMobile: boolean) =>
  browserName === 'chromium' && !isMobile;

test.describe('Mini Mode', () => {
  test('opens the call in a Document Picture-in-Picture window only where it is supported', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const miniModeButton = page.getByTestId('mini-mode-button');

    await joinMeeting(page, `Mini ${browserName}`);

    if (!isDesktopChromium(browserName, isMobile)) {
      await expect(miniModeButton).toHaveCount(0);
      return;
    }

    await miniModeButton.click();

    await expect
      .poll(() =>
        page.evaluate(() =>
          Boolean(
            (
              window as PictureInPictureCapableWindow
            ).documentPictureInPicture?.window?.document.querySelector(
              '[data-testid="mini-call-window"]'
            )
          )
        )
      )
      .toBe(true);
  });
});
