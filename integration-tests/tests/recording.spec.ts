import { expect } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

test.describe('Recording Feature', () => {
  test('should start and stop recording and verify the download link', async ({
    page: pageOne,
    browserName,
    isMobile,
  }) => {
    const roomName = randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
      audioOff: true,
      browserName,
    });

    await waitAndClickFirefox(pageOne, browserName);
    await pageOne.waitForSelector('.publisher', { state: 'visible' });

    if (isMobile) {
      await pageOne.getByTestId('MoreVertIcon').click();
      await pageOne.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
    }
    const archivingButton = pageOne.getByTestId('archiving-button');
    await archivingButton.click();

    const confirmStartButton = pageOne.getByTestId('popup-dialog-primary-button');
    await confirmStartButton.click();

    if (isMobile) {
      const recordingIndicator = pageOne
        .getByTestId('smallViewportHeader')
        .getByTestId('RadioButtonCheckedIcon');

      await expect(recordingIndicator).toBeVisible({ timeout: 5000 });

      await expect
        .poll(() => recordingIndicator.evaluate((el) => window.getComputedStyle(el).color), {
          message: 'Waiting for recording to start (mobile red icon)',
          timeout: 5000,
        })
        .toBe('rgb(239, 68, 68)');

      await pageOne.getByTestId('MoreVertIcon').click();
      await pageOne.mouse.move(0, 0);
    } else {
      await expect
        .poll(
          () => archivingButton.locator('svg').evaluate((el) => window.getComputedStyle(el).color),
          {
            message: 'Waiting for recording to start (red icon)',
            timeout: 5000,
          }
        )
        .toBe('rgb(239, 68, 68)');
    }
    await archivingButton.click();
    await confirmStartButton.click();

    await expect
      .poll(
        () => archivingButton.locator('svg').evaluate((el) => window.getComputedStyle(el).color),
        {
          message: 'Waiting for recording to stop (white icon)',
          timeout: 5000,
        }
      )
      .toBe('rgb(255, 255, 255)');

    await pageOne.getByTestId('CallEndIcon').click();

    await pageOne.getByText('Recording 1', { exact: true }).waitFor();

    const downloadIcon = pageOne.getByTestId('archive-download-button');
    await expect(downloadIcon).toBeVisible({ timeout: 10000 });

    const href = await downloadIcon.evaluate((el) => {
      const anchor = el.closest('a');
      return anchor ? anchor.href : null;
    });

    expect(href).toBeTruthy();
  });
});
