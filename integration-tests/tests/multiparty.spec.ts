import { expect, type BrowserContext, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

type OpenMeetingWithThreeParticipantsArgs = {
  pageOne: Page;
  context: BrowserContext;
  browserName: string;
};

const getLayoutScreenshotOptions = (page: Page) => ({
  mask: [
    page.locator('.video__element'),
    page.locator('[data-testid="app-version"]'),
    page.locator('.timestamp'),
  ],
  maxDiffPixelRatio: 0.01,
  fullPage: true,
});

async function openMeetingWithThreeParticipantsAndAssertVisibility({
  pageOne,
  context,
  browserName,
}: OpenMeetingWithThreeParticipantsArgs): Promise<void> {
  const roomName = crypto.randomBytes(5).toString('hex');

  await openMeetingRoomWithSettings({
    page: pageOne,
    username: 'User One',
    roomName,
  });
  await waitUntilReady(pageOne, browserName);

  await expect(pageOne.getByTestId('publisher-container').getByText('User One')).toBeVisible();

  const pageTwo = await context.newPage();
  await openMeetingRoomWithSettings({
    page: pageTwo,
    username: 'User Two',
    roomName,
  });
  await waitUntilReady(pageTwo, browserName);

  const pageThree = await context.newPage();
  await openMeetingRoomWithSettings({
    page: pageThree,
    username: 'User Three',
    roomName,
  });
  await waitUntilReady(pageThree, browserName);

  await pageOne.waitForSelector('.subscriber', { state: 'visible' });
  await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible();
  await expect(pageOne.locator('.subscriber').getByText('User Three')).toBeVisible();
}

test('should display appropriate layout when layout button is clicked on Mobile Browser', async ({
  page: pageOne,
  context,
  browserName,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile only layout test');
  await openMeetingWithThreeParticipantsAndAssertVisibility({ pageOne, context, browserName });

  await expect(pageOne).toHaveScreenshot(
    'layout-active-speaker-default.png',
    getLayoutScreenshotOptions(pageOne)
  );

  await pageOne.getByTestId('hidden-toolbar-items').click();

  await expect(pageOne.getByTestId('layout-button')).toBeVisible();
  await pageOne.getByTestId('layout-button').click();

  await expect(pageOne).toHaveScreenshot(
    'layout-active-speaker-first-click.png',
    getLayoutScreenshotOptions(pageOne)
  );

  await pageOne.getByTestId('hidden-toolbar-items').click();

  await expect(pageOne.getByTestId('layout-button')).toBeVisible();
  await pageOne.getByTestId('layout-button').click();

  await expect(pageOne).toHaveScreenshot(
    'layout-active-speaker-back-to-default.png',
    getLayoutScreenshotOptions(pageOne)
  );
});

test('should display appropriate layout when layout button is clicked on Desktop', async ({
  page: pageOne,
  context,
  browserName,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop-only layout test');
  await openMeetingWithThreeParticipantsAndAssertVisibility({ pageOne, context, browserName });

  await expect(pageOne.getByTestId('layout-button')).toBeVisible();

  await expect(pageOne).toHaveScreenshot(
    'layout-active-speaker-default.png',
    getLayoutScreenshotOptions(pageOne)
  );

  await pageOne.getByTestId('layout-button').click();

  await expect(pageOne).toHaveScreenshot(
    'layout-active-speaker-first-click.png',
    getLayoutScreenshotOptions(pageOne)
  );
});

test('should redirect to the waiting room if not bypassed', async ({ page: pageOne }) => {
  const roomName = crypto.randomBytes(5).toString('hex');
  const roomUrl = `${baseURL}room/${roomName}`;

  await pageOne.goto(roomUrl);

  await expect(pageOne).toHaveURL(`${baseURL}waiting-room/${roomName}`);
});

test('should publish and subscribe with 3 participants', async ({
  page: pageOne,
  context,
  browserName,
}) => {
  const roomName = crypto.randomBytes(5).toString('hex');
  const roomUrl = `${baseURL}room/${roomName}?bypass=true`;

  const pageTwo = await context.newPage();
  const pageThree = await context.newPage();

  await pageOne.goto(roomUrl);

  // These clicks and waits are needed for firefox
  await waitUntilReady(pageOne, browserName);

  await pageTwo.goto(roomUrl);
  await waitUntilReady(pageTwo, browserName);

  await pageThree.goto(roomUrl);
  await waitUntilReady(pageThree, browserName);

  await pageThree.waitForSelector('.publisher', { state: 'visible' });
  await pageThree.waitForSelector('.subscriber', { state: 'visible' });

  await expect
    .poll(
      async () => {
        return (await pageThree.locator('.video__element').all()).length;
      },
      { timeout: 10000 }
    )
    .toBe(3);
});

test('should display username on publisher and subscribers', async ({
  page: pageOne,
  context,
  browserName,
}) => {
  const roomName = crypto.randomBytes(5).toString('hex');
  await openMeetingRoomWithSettings({
    page: pageOne,
    username: 'User One',
    roomName,
  });
  await waitUntilReady(pageOne, browserName);

  await pageOne.waitForSelector('.publisher', { state: 'visible' });

  await pageOne
    .getByTestId('publisher-container')
    .getByText('User One')
    .waitFor({ state: 'visible' });
  void expect(await pageOne.getByTestId('publisher-container').getByText('User One')).toBeVisible();

  const pageTwo = await context.newPage();
  await openMeetingRoomWithSettings({
    page: pageTwo,
    username: 'User Two',
    roomName,
  });
  await waitUntilReady(pageTwo, browserName);

  await pageOne.waitForSelector('.subscriber', { state: 'visible' });
  await expect(await pageOne.locator('.subscriber').getByText('User Two')).toBeVisible();
});

test('should display initials on publisher and subscribers', async ({
  page: pageOne,
  browserName,
  context,
}) => {
  const roomName = crypto.randomBytes(5).toString('hex');
  await openMeetingRoomWithSettings({
    page: pageOne,
    username: 'Simone Arianne Biles Owens',
    roomName,
    videoOff: true,
  });
  await waitUntilReady(pageOne, browserName);

  await pageOne.waitForSelector('.publisher', { state: 'visible' });

  await pageOne.getByText(/SO/).waitFor({ state: 'visible' });
  await expect(await pageOne.getByText(/SO/)).toBeVisible();

  const pageTwo = await context.newPage();
  await openMeetingRoomWithSettings({
    page: pageTwo,
    username: 'Katie Ledecky',
    roomName,
    videoOff: true,
  });
  await waitUntilReady(pageTwo, browserName);

  await pageTwo.waitForSelector('.publisher', { state: 'visible' });
  await expect(pageTwo.getByText(/SO/)).toBeVisible();
  await expect(pageTwo.getByText(/KL/)).toBeVisible();

  await expect(pageOne.getByText(/KL/)).toBeVisible();
});

test.describe('display name for screenshare', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'screenshare tests only supported on chrome desktop'
  );
  test('should display username on screenshare publisher and subscribers', async ({
    page: pageOne,
    context,
  }) => {
    const roomName = crypto.randomBytes(5).toString('hex');
    await openMeetingRoomWithSettings({
      page: pageOne,
      username: 'User One',
      roomName,
    });

    const pageTwo = await context.newPage();
    await openMeetingRoomWithSettings({
      page: pageTwo,
      username: 'User Two',
      roomName,
    });

    await pageOne.waitForSelector('.publisher', { state: 'visible' });
    await pageTwo.waitForSelector('.subscriber', { state: 'visible' });
    const screenshareButton = await pageOne.getByTestId('ScreenShareIcon');
    await screenshareButton.click();

    await expect(
      await pageOne
        .getByTestId('screen-publisher-container')
        .getByText(`You are sharing your screen.`)
    ).toBeVisible();

    // Wait for the screen-subscriber to appear
    await pageTwo.waitForSelector('.screen-subscriber', { state: 'visible' });

    await expect(
      await pageTwo.locator('.screen-subscriber').getByText(`User One's screen`)
    ).toBeVisible();
  });
});
