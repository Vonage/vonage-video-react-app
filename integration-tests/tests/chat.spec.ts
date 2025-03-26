import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

async function chatToggleButton(page, isMobile) {
  const chatButton = await page.getByTestId('chat-button', { exact: true });
  if (isMobile) {
    console.log(isMobile);
    await page.getByTestId('MoreVertIcon').click();
    await page.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
    await chatButton.click();
  } else {
    await page.getByTestId('chat-button-unread-count');
    // Check that chat open shows blue button
    await chatButton.toHaveCSS('color', 'rgb(130, 177, 255)');
  }
}

test.describe('chat', () => {
  test('should send chat messages and show unread number', async ({
    page: pageOne,
    context,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');
    const pageTwo = await context.newPage();

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
    });
    await waitAndClickFirefox(pageOne, browserName);

    await openMeetingRoomWithSettings({
      page: pageTwo,
      username: 'User Two',
      roomName,
    });
    await waitAndClickFirefox(pageTwo, browserName);

    await pageTwo.waitForSelector('.publisher', { state: 'visible' });
    await pageTwo.waitForSelector('.subscriber', { state: 'visible' });

    await chatToggleButton(pageOne, isMobile);

    // Send button is greyed out when text box empty
    await expect(pageOne.getByTestId('SendIcon')).toHaveCSS('color', 'rgb(178, 180, 182)');

    await pageOne.getByPlaceholder('Send a message').fill('Hi there, welcome to the meeting!');

    // Send button is blue when text in box
    await expect(pageOne.getByTestId('SendIcon')).toHaveCSS('color', 'rgb(130, 177, 255)');

    await pageOne.getByTestId('SendIcon').click();

    // check unread notification is present on page two
    if (isMobile) {
      await expect(
        pageTwo
          .getByTestId('chat-button-unread-count')
          .filter({ has: pageTwo.locator('[data-testid="MoreVertIcon"]') })
      ).toHaveText('1');
      await chatToggleButton(pageTwo, isMobile);
    } else {
      await expect(pageTwo.getByTestId('chat-button-unread-count')).toHaveText('1');
      await pageTwo.getByTestId('chat-button-unread-count').click();
    }

    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    await pageTwo.waitForFunction(async () => {
      const badge = document.querySelector(
        '[data-testid="chat-button-unread-count"]'
      ) as HTMLElement;
      return badge.offsetHeight === 0 && badge.offsetWidth === 0;
    });

    await expect(pageTwo.getByTestId('chat-message').getByRole('paragraph')).toHaveText(
      'Hi there, welcome to the meeting!'
    );
    await expect(pageTwo.getByTestId('chat-msg-participant-name')).toHaveText('User One');
    await pageTwo.getByPlaceholder('Send a message').fill('Thanks!');
    await pageTwo.getByTestId('SendIcon').click();

    const messageTwo = await pageTwo.getByTestId('chat-message').nth(1);

    await expect(messageTwo.getByTestId('chat-msg-participant-name')).toHaveText('User Two');
    await expect(messageTwo.getByRole('paragraph')).toHaveText('Thanks!');
  });
});
