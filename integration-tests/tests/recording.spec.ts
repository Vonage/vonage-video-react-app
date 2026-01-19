import { expect } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

test.describe('Recording Feature', () => {
  test.setTimeout(150000);

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
    await confirmStartButton.waitFor({ state: 'visible' });
    await confirmStartButton.click();

    // Wait a bit to ensure recording is at least 3s long
    await pageOne.waitForTimeout(3000);

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
        .toBe('rgb(230, 29, 29)');

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
        .toBe('rgb(255, 255, 255)');
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

    await expect(pageOne).toHaveURL(/.*goodbye/, { timeout: 10000 });

    // Wait for archive list section to appear
    const archiveListLabel = pageOne.getByText('Download recordings', { exact: false });
    await expect(archiveListLabel).toBeVisible({ timeout: 10000 });

    // Give the API a moment to fetch archives
    await pageOne.waitForTimeout(3000);

    // Wait for an archive to appear (might be in loading/pending state initially)
    // Check for either loading text or archive list item - try loading text first, then archive item
    // Increased timeout to 60s to account for slow API responses
    try {
      await pageOne
        .getByText('We are processing your recording', { exact: false })
        .waitFor({ timeout: 60000, state: 'visible' });
    } catch {
      try {
        await pageOne
          .locator('[data-testid^="archive-list-item-"]')
          .first()
          .waitFor({ timeout: 60000, state: 'visible' });
      } catch {
        // Check for error state
        const errorText = pageOne.getByText('There was an error loading recordings', {
          exact: false,
        });
        const hasError = await errorText.isVisible().catch(() => false);
        if (hasError) {
          throw new Error(
            'Archive list shows error state - archives failed to load. This may indicate a backend API issue.'
          );
        }
        throw new Error(
          'No archive appeared after 60 seconds. Archive may not have been created or API is not responding.'
        );
      }
    }

    // Now wait for the archive to become available (download button appears)
    const downloadIcon = pageOne.getByTestId('archive-download-button');
    await expect(downloadIcon).toBeVisible({ timeout: 120000 });

    const href = await downloadIcon.evaluate((el) => {
      const anchor = el.closest('a');
      return anchor ? anchor.href : null;
    });

    expect(href).toBeTruthy();
  });
});
