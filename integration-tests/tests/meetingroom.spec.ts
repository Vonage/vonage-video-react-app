import { expect } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

test.describe('meeting room', () => {
  test('should allow a user to mute another participant', async ({
    page: pageOne,
    browser,
    browserName,
    isMobile,
  }) => {
    const roomName = randomBytes(5).toString('hex');

    // Use a separate context for User Two to avoid localStorage pollution
    const contextTwo = await browser.newContext();
    const pageTwo = await contextTwo.newPage();

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
      audioOff: true,
      browserName,
    });
    // These clicks and waits are needed for firefox
    await waitUntilReady(pageOne, browserName);

    await openMeetingRoomWithSettings({
      page: pageTwo,
      username: 'User Two',
      roomName,
      audioOff: false,
      browserName,
    });
    await expect(pageTwo.getByTestId('MicNoneIcon')).toBeVisible();

    // Wait for User Two's subscriber tile to appear on pageOne before opening participant list
    await pageOne.waitForSelector('.subscriber', { state: 'visible' });
    await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible();

    if (isMobile) {
      await pageOne.getByTestId('MoreVertIcon').click();
      await pageOne.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
    }

    const participantsListButton = await pageOne.getByTestId('PeopleIcon');
    await participantsListButton.click();

    const participantItem = await pageOne.locator('[data-testid^="participant-list-item"]', {
      hasText: 'User Two',
    });

    await participantItem.getByTestId('MicIcon').click();
    await pageOne.getByTestId('popup-dialog-primary-button').click();

    await expect(pageTwo.getByTestId('MicOffToolbar')).toBeVisible();

    // Clean up the second context
    await contextTwo.close();
  });
});
