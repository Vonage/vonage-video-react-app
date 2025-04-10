import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { waitAndClickFirefox } from './utils';

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
    await waitAndClickFirefox(pageOne, browserName);
    await expect(pageOne.getByTestId('MicNoneIcon')).toBeVisible();

    await pageOne.waitForSelector('.publisher', { state: 'visible' });

    // mute user on the first page
    await pageOne.getByTestId('MicNoneIcon').click();

    // the second user will play an audio file defined in the playwright config and it will become the active speaker
    await pageTwo.goto(roomUrl);

    await waitAndClickFirefox(pageTwo, browserName);

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
    // Check if the height of the subscriber is at least double the height of the publisher
    expect(newSizeSub.height).toBeGreaterThan(1.9 * newSizePub.height);
    console.log(newSizeSub.height / newSizePub.height);
  });
});
