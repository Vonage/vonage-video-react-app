import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitAndClickFirefox } from './utils';

test.describe('participant pinning', () => {
  test('pinned participants should be larger', async ({
    page: pageOne,
    context,
    browserName,
    isMobile,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');

    const pageTwo = await context.newPage();
    const pageThree = await context.newPage();

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
      audioOff: true,
      browserName,
    });
    await waitAndClickFirefox(pageTwo, browserName);
    await openMeetingRoomWithSettings({
      page: pageThree,
      username: 'User Three',
      roomName,
      audioOff: true,
      browserName,
    });
    await waitAndClickFirefox(pageThree, browserName);

    await pageThree.waitForSelector('.publisher', { state: 'visible' });
    await pageThree.waitForSelector('.subscriber', { state: 'visible' });

    await expect(await pageThree.locator('.subscriber').getByText('User Two')).toBeVisible();
    if (isMobile) {
      await pageThree.getByTestId('MoreVertIcon').click();
      await pageThree.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
      await pageThree.getByTestId('ViewSidebarIcon').click();
      await pageThree.getByTestId('MoreVertIcon').click(); // On mobile after changing the layout the kebab menu is not auto closed
    } else {
      // Change view to grid layout
      await pageThree.getByTestId('ViewSidebarIcon').click();
    }
    // Give the page some time to render the grid layout
    await pageThree.waitForTimeout(500);

    const userTwoSubscriber = await pageThree
      .getByTestId(/subscriber-container/)
      .filter({ has: pageThree.getByText('User Two') });

    await userTwoSubscriber.focus();
    await userTwoSubscriber.hover();

    const pinUserTwoButton = await userTwoSubscriber.getByTestId('pin-button');
    await pinUserTwoButton.click();

    const publisher = await pageThree.locator('.publisher');
    const userTwoSubscriberRet = await userTwoSubscriber.boundingBox();
    const publisherRect = await publisher.boundingBox();
    expect(userTwoSubscriberRet.width).toBeGreaterThan(1.2 * publisherRect.width);
    expect(userTwoSubscriberRet.height).toBeGreaterThan(2 * publisherRect.height);

    // unpinning user 2 from the participants list
    if (isMobile) {
      await pageThree.getByTestId('MoreVertIcon').click();
      await pageThree.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
    }

    const participantsListButton = await pageThree.getByTestId('PeopleIcon');
    await participantsListButton.click();

    const participantItem = await pageThree.locator('[data-testid^="participant-list-item"]', {
      hasText: 'User Two',
    });
    // Within that list item, find and click the MoreVert button
    await participantItem.getByTestId('MoreVertIcon').click();

    await pageThree
      .locator('[data-testid^="pin-menu-item"]', {
        hasText: 'Unpin User Two',
      })
      .click();

    const closeIconButton = pageThree.locator(
      '//span[contains(text(),"Participants")]/following-sibling::button'
    );
    await closeIconButton.click();

    const newUserTwoSubscriberRet = await userTwoSubscriber.boundingBox();
    const newPublisherRect = await publisher.boundingBox();

    await pageThree.waitForTimeout(1000);
    expect(newUserTwoSubscriberRet.width).toBeLessThan(1.2 * newPublisherRect.width);
    expect(newUserTwoSubscriberRet.height).toBeLessThan(2 * newPublisherRect.height);
  });
});
