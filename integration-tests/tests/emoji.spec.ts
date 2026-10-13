import { expect, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

type OpenEmojiGridArgs = {
  page: Page;
  isMobile: boolean;
};

const THUMBS_UP_EMOJI = '👍';
const CELEBRATION_EMOJI = '🎉';
const EXPECTED_EMOJI_COUNT = 12;
/** Emoji visibility duration in milliseconds before automatic removal. */
const EMOJI_DISPLAY_DURATION = 5_000;
/** Extra milliseconds to allow removal cleanup to complete before asserting disappearance. */
const EMOJI_REMOVAL_BUFFER = 1_000;

/**
 * Opens the emoji grid on the given page.
 * On mobile, opens the overflow menu first.
 * @param {OpenEmojiGridArgs} args - The page and mobile flag.
 * @returns {Promise<void>}
 */
async function openEmojiGrid({ page, isMobile }: OpenEmojiGridArgs): Promise<void> {
  await clickEmojiGridButton({ page, isMobile });

  await expect(page.getByTestId('emoji-grid')).toBeVisible();
}

/**
 * Clicks the emoji grid toggle button.
 * On mobile, opens the overflow menu first.
 * @param {OpenEmojiGridArgs} args - The page and mobile flag.
 * @returns {Promise<void>}
 */
async function clickEmojiGridButton({ page, isMobile }: OpenEmojiGridArgs): Promise<void> {
  if (isMobile) {
    await page.getByTestId('MoreVertIcon').click();
    // Move the pointer to the top-left corner (0,0) so overflow overlays/tooltips do not block the emoji button.
    await page.mouse.move(0, 0);
  }

  await page.getByTestId('emoji-grid-button').click();
}

/**
 * Clicks an emoji button inside the emoji grid.
 * @param {Page} page - The Playwright page.
 * @param {string} emoji - The emoji character to click.
 * @returns {Promise<void>}
 */
async function clickEmoji(page: Page, emoji: string): Promise<void> {
  await page.getByTestId('emoji-grid').getByRole('button', { name: emoji, exact: true }).click();
}

test.describe('emoji', () => {
  const isEmojiEnabled = process.env.ALLOW_EMOJIS !== 'false';

  test.skip(!isEmojiEnabled, 'Skipping emoji tests when emojis are disabled');

  test('should open and close the emoji grid when the emoji button is toggled', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    await openEmojiGrid({ page, isMobile });

    const emojiGrid = page.getByTestId('emoji-grid');
    await expect(emojiGrid).toBeVisible();

    const emojiButtons = emojiGrid.getByRole('button');
    await expect(emojiButtons).toHaveCount(EXPECTED_EMOJI_COUNT);

    // Close the grid by clicking the button again
    await clickEmojiGridButton({ page, isMobile });
    await expect(emojiGrid).not.toBeVisible();
  });

  test('should close the emoji grid when clicking outside of it', async ({
    page,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({ page, username: 'User One', roomName, browserName });
    await waitUntilReady(page, browserName);
    await page.waitForSelector('.publisher', { state: 'visible' });

    await openEmojiGrid({ page, isMobile });

    const emojiGrid = page.getByTestId('emoji-grid');
    await expect(emojiGrid).toBeVisible();

    // Click away from the grid to dismiss it
    await page.locator('.publisher').click();
    await expect(emojiGrid).not.toBeVisible();
  });

  test('should send emoji to another participant', async ({
    page: firstParticipantPage,
    context,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({
      page: firstParticipantPage,
      username: 'User One',
      roomName,
      browserName,
    });
    await waitUntilReady(firstParticipantPage, browserName);
    await firstParticipantPage.waitForSelector('.publisher', { state: 'visible' });

    const secondParticipantPage = await context.newPage();
    await openMeetingRoomWithSettings({
      page: secondParticipantPage,
      username: 'User Two',
      roomName,
      browserName,
    });
    await waitUntilReady(secondParticipantPage, browserName);

    await secondParticipantPage.waitForSelector('.publisher', { state: 'visible' });
    await secondParticipantPage.waitForSelector('.subscriber', { state: 'visible' });

    await openEmojiGrid({ page: firstParticipantPage, isMobile });
    await clickEmoji(firstParticipantPage, THUMBS_UP_EMOJI);

    const secondParticipantEmoji = secondParticipantPage
      .getByTestId('emoji-string-container')
      .filter({ hasText: THUMBS_UP_EMOJI })
      .first();

    await expect(secondParticipantEmoji).toContainText(THUMBS_UP_EMOJI);
    await expect(secondParticipantEmoji).toContainText('User One');
  });

  test('should show "You" label when sender views their own emoji', async ({
    page: firstParticipantPage,
    context,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({
      page: firstParticipantPage,
      username: 'User One',
      roomName,
      browserName,
    });
    await waitUntilReady(firstParticipantPage, browserName);
    await firstParticipantPage.waitForSelector('.publisher', { state: 'visible' });

    const secondParticipantPage = await context.newPage();
    await openMeetingRoomWithSettings({
      page: secondParticipantPage,
      username: 'User Two',
      roomName,
      browserName,
    });
    await waitUntilReady(secondParticipantPage, browserName);

    await secondParticipantPage.waitForSelector('.publisher', { state: 'visible' });
    await secondParticipantPage.waitForSelector('.subscriber', { state: 'visible' });

    await openEmojiGrid({ page: firstParticipantPage, isMobile });
    await clickEmoji(firstParticipantPage, CELEBRATION_EMOJI);

    const senderEmoji = firstParticipantPage
      .getByTestId('emoji-string-container')
      .filter({ hasText: CELEBRATION_EMOJI })
      .first();

    await expect(senderEmoji).toContainText(CELEBRATION_EMOJI);
    await expect(senderEmoji).toContainText('You');
  });

  test('should remove emoji after display duration expires', async ({
    page: firstParticipantPage,
    context,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    await openMeetingRoomWithSettings({
      page: firstParticipantPage,
      username: 'User One',
      roomName,
      browserName,
    });
    await waitUntilReady(firstParticipantPage, browserName);
    await firstParticipantPage.waitForSelector('.publisher', { state: 'visible' });

    const secondParticipantPage = await context.newPage();
    await openMeetingRoomWithSettings({
      page: secondParticipantPage,
      username: 'User Two',
      roomName,
      browserName,
    });
    await waitUntilReady(secondParticipantPage, browserName);

    await secondParticipantPage.waitForSelector('.publisher', { state: 'visible' });
    await secondParticipantPage.waitForSelector('.subscriber', { state: 'visible' });

    await openEmojiGrid({ page: firstParticipantPage, isMobile });
    await clickEmoji(firstParticipantPage, THUMBS_UP_EMOJI);

    const receivedEmoji = secondParticipantPage
      .getByTestId('emoji-string-container')
      .filter({ hasText: THUMBS_UP_EMOJI });

    await expect(receivedEmoji.first()).toBeVisible();

    await expect(receivedEmoji).toHaveCount(0, {
      timeout: EMOJI_DISPLAY_DURATION + EMOJI_REMOVAL_BUFFER,
    });
  });
});
