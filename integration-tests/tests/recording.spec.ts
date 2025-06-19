import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

test.describe('meeting room', () => {
  test('force mute', async ({ page: pageOne, browserName }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
      audioOff: true,
      browserName,
    });
    // These clicks and waits are needed for firefox
    await waitAndClickFirefox(pageOne, browserName);

    await pageOne.waitForSelector('.publisher', { state: 'visible' });

    const archivingButton = await pageOne.getByTestId('archiving-button');
    await archivingButton.click();
    const popupPrimaryButton = await pageOne.getByTestId('popup-dialog-primary-button');
    await popupPrimaryButton.click();
    await expect
      .poll(
        () => archivingButton.locator('svg').evaluate((el) => window.getComputedStyle(el).color),
        {
          message: 'Waiting for color to become rgb(239, 68, 68)',
          timeout: 5000,
        }
      )
      .toBe('rgb(239, 68, 68)');

    await archivingButton.click();
    await popupPrimaryButton.click();

    await expect
      .poll(
        () => archivingButton.locator('svg').evaluate((el) => window.getComputedStyle(el).color),
        {
          message: 'Waiting for color to become rgb(239, 68, 68)',
          timeout: 5000,
        }
      )
      .toBe('rgb(255, 255, 255)');

    await pageOne.getByTestId('CallEndIcon').click();

    await pageOne.getByText('Recording 1', { exact: true }).waitFor();

    const downloadButton = pageOne.getByTestId('archive-download-button');
    await expect(downloadButton).toBeVisible({ timeout: 10000 });

    // 3. Set up the download listener before clicking
    const downloadPromise = pageOne.waitForEvent('download');

    // 4. Click the button to trigger download
    await downloadButton.click();

    // 5. Wait for the download to complete
    const download = await downloadPromise;

    // 6. Save the download to a known location
    const suggestedFilename = download.suggestedFilename();
    const filePath = path.join(__dirname, suggestedFilename);
    await download.saveAs(filePath);

    // 7. Assert the file was saved
    expect(fs.existsSync(filePath)).toBeTruthy();

    // 8. Optionally, delete the file after the test
    fs.unlinkSync(filePath);
  });
});
