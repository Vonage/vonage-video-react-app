import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { Page } from '@playwright/test';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

const ACTIVE_SPEAKER_SWITCH_TIMEOUT = 2500;

const setMicrophone = async (page: Page, isOn: boolean) => {
  await page
    .getByTestId(isOn ? 'MicOffToolbar' : 'MicNoneIcon')
    .first()
    .click();
  await expect(page.getByTestId(isOn ? 'MicNoneIcon' : 'MicOffToolbar').first()).toBeVisible();
};

const getLargestSubscriberTileText = (page: Page) =>
  page.locator('[data-testid^="subscriber-container-"]').evaluateAll((tiles): string => {
    const largestTile = tiles.reduce<{ area: number; text: string }>(
      (largest, tile) => {
        const { width, height } = tile.getBoundingClientRect();
        const area = width * height;
        return area > largest.area ? { area, text: (tile as HTMLElement).innerText } : largest;
      },
      { area: 0, text: '' }
    );
    return largestTile.text;
  });

test.describe('active speaker', () => {
  test('should display the active speaker in a larger tile', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    // navigate to random room
    const roomName = crypto.randomBytes(5).toString('hex');
    const roomUrl = `${baseURL}room/${roomName}?bypass=true`;

    const pageTwo = await context.newPage();

    await pageOne.goto(roomUrl);
    await waitUntilReady(pageOne, browserName);
    await expect(pageOne.getByTestId('MicNoneIcon')).toBeVisible();

    await pageOne.waitForSelector('.publisher', { state: 'visible' });

    // mute user on the first page
    await pageOne.getByTestId('MicNoneIcon').click();

    // the second user will play an audio file defined in the playwright config and it will become the active speaker
    await pageTwo.goto(roomUrl);

    await waitUntilReady(pageTwo, browserName);

    const publisher = await pageOne.locator('.publisher');

    const subscriber = await pageOne.locator('.subscriber');

    // Wait for the subscriber to become the active speaker and increase its size
    await pageOne.waitForSelector('.subscriber', { state: 'visible' });

    // Get the new size of the subscriber element
    const newSizeSub = await subscriber.boundingBox();

    // Get the new size of the publisher element
    const newSizePub = await publisher.boundingBox();

    // Check if the width of the subscriber is at least 20% higher than the publisher's
    expect(newSizeSub.width).toBeGreaterThan(1.2 * newSizePub.width);
    // Check if the height of the subscriber is at almost double the height of the publisher
    expect(newSizeSub.height).toBeGreaterThan(1.9 * newSizePub.height);
  });

  test('moves the large tile to whoever starts speaking within 2.5 seconds', async ({
    page: watcherPage,
    context,
    browserName,
    isMobile,
  }) => {
    test.skip(isMobile, 'The active speaker layout needs room for a large tile');
    // Firefox cannot play the speech WAV as fake microphone input, so no speaker switch is detected.
    test.skip(
      browserName === 'firefox',
      'With its fake microphone on CI, Firefox never switches the active speaker'
    );
    const roomName = crypto.randomBytes(5).toString('hex');
    const alicePage = await context.newPage();
    const bobPage = await context.newPage();

    await openMeetingRoomWithSettings({
      page: watcherPage,
      roomName,
      username: 'Watcher',
      audioOff: true,
      browserName,
    });
    await openMeetingRoomWithSettings({
      page: alicePage,
      roomName,
      username: 'Alice',
      browserName,
    });
    await openMeetingRoomWithSettings({
      page: bobPage,
      roomName,
      username: 'Bob',
      audioOff: true,
      browserName,
    });
    await expect(watcherPage.locator('[data-testid^="subscriber-container-"]')).toHaveCount(2, {
      timeout: 30_000,
    });
    await expect.poll(() => getLargestSubscriberTileText(watcherPage)).toContain('Alice');

    for (const [nextSpeaker, nextPage, previousPage] of [
      ['Bob', bobPage, alicePage],
      ['Alice', alicePage, bobPage],
    ] as const) {
      await setMicrophone(previousPage, false);
      await setMicrophone(nextPage, true);

      await expect
        .poll(() => getLargestSubscriberTileText(watcherPage), {
          timeout: ACTIVE_SPEAKER_SWITCH_TIMEOUT,
          intervals: [100],
        })
        .toContain(nextSpeaker);
    }
  });
});
