import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

test.describe('meeting room', () => {
  test('force mute', async ({ page: pageOne, context, browserName, isMobile }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    const pageTwo = await context.newPage();

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
      audioOff: true,
      browserName,
    });
    // These clicks and waits are needed for firefox
    await waitAndClickFirefox(pageOne, browserName);

    await openMeetingRoomWithSettings({
      page: pageTwo,
      username: 'User Two',
      roomName,
      audioOff: false,
      browserName,
    });
    await expect(pageTwo.getByTestId('MicNoneIcon')).toBeVisible();

    if (isMobile) {
      await pageOne.getByTestId('MoreVertIcon').click();
      await pageOne.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
    }

    const participantsListButton = await pageOne.getByTestId('PeopleIcon');
    await participantsListButton.click();

    const participantItem = await pageOne.locator('[data-testid^="participant-list-item"]', {
      hasText: 'User Two',
    });
    // Within that list item, find and click the MoreVert button
    await participantItem.getByTestId('MicIcon').click();

    await pageOne.getByTestId('popup-dialog-primary-button').click;

    await expect(pageTwo.getByTestId('MicOffToolbar')).toBeVisible();
  });
});
