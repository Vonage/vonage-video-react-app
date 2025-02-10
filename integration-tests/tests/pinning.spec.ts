import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

test.describe('participant pinning', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile);

  test('pinned participants should be larger', async ({ page: pageOne, context, browserName }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    const pageTwo = await context.newPage();
    const pageThree = await context.newPage();

    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
      audioOff: true,
    });
    // These clicks and waits are needed for firefox
    await waitAndClickFirefox(pageOne, browserName);

    await openMeetingRoomWithSettings({
      page: pageTwo,
      username: 'User Two',
      roomName,
      audioOff: true,
    });
    await waitAndClickFirefox(pageTwo, browserName);
    await openMeetingRoomWithSettings({
      page: pageThree,
      username: 'User Three',
      roomName,
      audioOff: true,
    });
    await waitAndClickFirefox(pageThree, browserName);

    await pageThree.waitForSelector('.publisher', { state: 'visible' });
    await pageThree.waitForSelector('.subscriber', { state: 'visible' });

    await expect(await pageOne.locator('.subscriber').getByText('User Two')).toBeVisible();

    const userTwoSubscriber = await pageOne
      .getByTestId(/subscriber\-container/)
      .filter({ has: pageOne.getByText('User Two') });

    await userTwoSubscriber.focus();

    const pinUserTwoButton = await userTwoSubscriber.getByTestId('pin-button');
    await pinUserTwoButton.click();

    const publisher = await pageOne.locator('.publisher');
    const userTwoSubscriberRet = await userTwoSubscriber.boundingBox();
    const publisherRect = await publisher.boundingBox();
    expect(userTwoSubscriberRet.width).toBeGreaterThan(1.2 * publisherRect.width);
    expect(userTwoSubscriberRet.height).toBeGreaterThan(2 * publisherRect.height);
  });
});
