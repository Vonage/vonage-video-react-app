import { expect } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings } from './utils';

test.describe('Recording Feature', () => {
  test('should start and stop recording and verify the download link', async ({
    page: pageOne,
    browserName,
    isMobile,
  }) => {
    const roomName = randomBytes(5).toString('hex');

    // locators
    const root = pageOne.locator('#root');
    const publisher = pageOne.locator('.publisher');
    const moreVertIcon = pageOne.getByTestId('MoreVertIcon');
    const archivingButton = pageOne.getByTestId('archiving-button');
    const confirmButton = pageOne.getByTestId('popup-dialog-primary-button');
    const meetingRoom = pageOne.getByTestId('meetingRoom');
    const checkedIcon = pageOne.locator(
      '[data-testid="smallViewportHeader"] [data-testid="recordingIndicator"]'
    );
    const endCallButton = pageOne.getByTestId('CallEndIcon');
    const recordingItem = pageOne.getByTestId('archive-list-item-title-0');
    const downloadIcon = pageOne.getByTestId('archive-download-button');
    const archiveEmptyList = pageOne.getByTestId('archive-list-empty');

    await test.step('Open meeting room', async () => {
      await openMeetingRoomWithSettings({
        page: pageOne,
        username: 'User One',
        roomName,
        audioOff: true,
        browserName,
      });
    });

    await test.step('Wait for publisher to be ready', async () => {
      // Give some time to opentok to settle, in the future we'll remove this wait.
      await pageOne.waitForTimeout(2000);
      // Required for Firefox to ensure publisher is initialized
      await root.click();

      await expect(publisher).toBeVisible();
    });

    if (isMobile) {
      await test.step('Open toolbar in small viewport', async () => {
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
      });
    }

    await test.step('Start archiving/recording', async () => {
      // Click archiving button
      await expect(archivingButton).toBeVisible();
      await archivingButton.click();

      // Confirm start recording in dialog
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();
    });

    if (isMobile) {
      await test.step('Close toolbar in small viewport', async () => {
        await expect(checkedIcon).toBeVisible();
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0);
      });
    }

    await test.step('Wait during recording', async () => {
      // Wait for the recording to actually start (accounts for RECORDING_START_DELAY + API latency)
      await expect(meetingRoom).toHaveClass(/\brecording\b/, { timeout: 10_000 });

      // If the archiving is less than 1 second the endpoint will not respond with the archive
      await pageOne.waitForTimeout(1000);
    });

    await test.step('Stop recording', async () => {
      await expect(archivingButton).toBeVisible();
      await archivingButton.click();

      await expect(confirmButton).toBeVisible();
      await confirmButton.click();

      // Expect recording indicator to disappear
      await expect(meetingRoom).not.toHaveClass(/\brecording\b/);
    });

    await test.step('End call', async () => {
      await expect(endCallButton).toBeVisible();
      await endCallButton.click();
    });

    await test.step('Wait for archive to be available', async () => {
      await expect(archiveEmptyList).not.toBeAttached();

      // Wait for the archive to be processed
      await expect(recordingItem).not.toHaveClass(/\bpending\b/, {
        timeout: 60 * 1000 * 3, // Wait up to 3 minutes for processing the archive
      });

      // Open the processed recording item to view its details and actions
      await recordingItem.click();
    });

    await test.step('Verify download link is present', async () => {
      await expect(downloadIcon).toBeVisible();

      const href = await downloadIcon.evaluate((el) => {
        const anchor = el.closest('a');
        return anchor ? anchor.href : null;
      });

      expect(href).toBeTruthy();
    });
  });
});
