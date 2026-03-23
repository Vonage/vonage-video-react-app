import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

/**
 * Toggles the chat button in the application.
 * - On mobile: opens the menu and clicks the chat button.
 * - On desktop: clicks the unread count and verifies the chat icon is highlighted.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {boolean} isMobile - Indicates whether the test is running on a mobile device.
 * @returns {Promise<void>} Resolves when the toggle action is completed.
 */
async function chatToggleButton(page, isMobile) {
  if (isMobile) {
    const chatToggleButtonOne = page.getByTestId('chat-button', { exact: true });
    await page.getByTestId('MoreVertIcon').click();
    await page.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
    chatToggleButtonOne.click();
  } else {
    const chatToggleButtonOne = await page.getByTestId('chat-button-unread-count');
    chatToggleButtonOne.click();
    // Check that chat open shows blue button
    await expect(page.getByTestId('ChatIcon')).toHaveCSS('color', 'rgb(0, 0, 0)');
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

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
      browserName,
    });
    await waitUntilReady(pageOne, browserName);

    // Wait for pageOne's publisher to be ready before opening pageTwo
    // This prevents both pages from competing for fake media devices simultaneously
    await pageOne.waitForSelector('.publisher', { state: 'visible' });

    const pageTwo = await context.newPage();
    await openMeetingRoomWithSettings({
      page: pageTwo,
      username: 'User Two',
      roomName,
      browserName,
    });
    await waitUntilReady(pageTwo, browserName);

    await pageTwo.waitForSelector('.publisher', { state: 'visible' });
    await pageTwo.waitForSelector('.subscriber', { state: 'visible' });

    await chatToggleButton(pageOne, isMobile);

    // Send button is greyed out when text box empty
    await expect(pageOne.getByTestId('SendIcon')).toHaveCSS('color', 'rgb(230, 230, 230)');

    const chatInputOne = pageOne.getByPlaceholder('Send a message');

    await chatInputOne.fill('Hi there, welcome to the meeting!');

    // Send button is blue when text in box
    await expect(pageOne.getByTestId('SendIcon')).toHaveCSS('color', 'rgb(153, 65, 255)');

    await chatInputOne.press('Enter');

    // check unread notification is present on page two
    if (isMobile) {
      const unreadBadge = pageTwo
        .getByTestId('chat-button-unread-count')
        .filter({ has: pageTwo.locator('[data-testid="MoreVertIcon"]') });
      await unreadBadge.waitFor({ state: 'visible', timeout: 5000 });
      await expect(unreadBadge).toHaveText('1');
      await chatToggleButton(pageTwo, isMobile);
    } else {
      const unreadBadge = pageTwo.getByTestId('chat-button-unread-count');
      await unreadBadge.waitFor({ state: 'visible', timeout: 5000 });
      await expect(unreadBadge).toHaveText('1');
      await pageTwo.getByTestId('chat-button-unread-count').click();
    }

    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    // eslint-disable-next-line @typescript-eslint/require-await
    await pageTwo.waitForFunction(async () => {
      const badge = document.querySelector<HTMLElement>('[data-testid="chat-button-unread-count"]');
      return badge.offsetHeight === 0 && badge.offsetWidth === 0;
    });

    await expect(pageTwo.getByTestId('chat-msg-content')).toHaveText(
      'Hi there, welcome to the meeting!'
    );
    await expect(pageTwo.getByTestId('chat-msg-participant-name')).toHaveText('User One');
    const chatInputTwo = pageTwo.getByPlaceholder('Send a message');

    await chatInputTwo.fill('Thanks!');
    await chatInputTwo.press('Enter');

    const messageTwo = await pageTwo.getByTestId('chat-message').nth(1);

    await expect(messageTwo.getByTestId('chat-msg-participant-name')).toHaveText('User Two');
    await expect(messageTwo.getByTestId('chat-msg-content')).toHaveText('Thanks!');
  });
});
