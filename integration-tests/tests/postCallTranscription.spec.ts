import { expect } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings } from './utils';

test.describe('Post-Call Transcription Feature', () => {
  test('should start and stop transcription and process the archive', async ({
    page: pageOne,
    browserName,
    isMobile,
  }) => {
    const roomName = randomBytes(5).toString('hex');

    const root = pageOne.locator('#root');
    const publisher = pageOne.locator('.publisher');
    const moreVertIcon = pageOne.getByTestId('MoreVertIcon');
    const transcriptionButton = pageOne.getByTestId('post-call-transcription-button');
    const confirmButton = pageOne.getByTestId('popup-dialog-primary-button');
    const transcriptionIndicator = pageOne.getByTestId('transcriptionIndicator').first();
    const endCallButton = pageOne.getByTestId('CallEndIcon');
    const transcriptionItem = pageOne.getByTestId('archive-list-item-title-0');
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
      await pageOne.waitForTimeout(2000);
      await root.click();

      await expect(publisher).toBeVisible();
    });

    if (isMobile) {
      await test.step('Open toolbar in small viewport', async () => {
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0);
      });
    }

    await test.step('Start post-call transcription', async () => {
      await expect(transcriptionButton).toBeVisible();
      await transcriptionButton.click();

      await expect(confirmButton).toBeVisible();
      await confirmButton.click();
    });

    if (isMobile) {
      await test.step('Close toolbar in small viewport', async () => {
        await expect(transcriptionIndicator).toBeVisible();
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0);
      });
    }

    await test.step('Wait during transcription', async () => {
      await expect(transcriptionIndicator).toBeVisible({ timeout: 10_000 });

      await pageOne.waitForTimeout(1000);
    });

    if (isMobile) {
      await test.step('Open toolbar to stop transcription', async () => {
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0);
      });
    }

    await test.step('Stop transcription', async () => {
      await expect(transcriptionButton).toBeVisible();
      await transcriptionButton.click();

      await expect(confirmButton).toBeVisible();
      await confirmButton.click();

      await expect(transcriptionIndicator).toBeHidden();
    });

    await test.step('End call', async () => {
      await expect(endCallButton).toBeVisible();
      await endCallButton.click();
    });

    await test.step('Wait for transcription to leave pending', async () => {
      await expect(archiveEmptyList).not.toBeAttached();

      await expect(transcriptionItem).not.toHaveClass(/\bpending\b/, {
        timeout: 60 * 1000 * 3,
      });
    });
  });
});
