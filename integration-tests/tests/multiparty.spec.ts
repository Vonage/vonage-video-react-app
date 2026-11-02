import { expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady, SCREENSHOT } from './utils';

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
  maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
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

test.describe('participant list and right panel', () => {
  test('should list every participant with the correct count and remove a participant who leaves', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context, browserName });

    await openRightPanelTab({ page: pageOne, buttonTestId: 'participant-list-button' });

    const rightPanelTitle = pageOne.getByTestId('right-panel-title');
    const participantListItems = pageOne.locator('[data-testid^="participant-list-item"]');
    await expect(rightPanelTitle).toHaveText('Participants (2)');
    await expect(participantListItems).toHaveCount(2);
    await expect(pageOne.getByTestId('participant-list-item-you')).toContainText('User One (You)');
    await expect(participantListItems.filter({ hasText: 'User Two' })).toHaveCount(1);

    await pageTwo.close();

    await expect(participantListItems.filter({ hasText: 'User Two' })).toHaveCount(0, {
      timeout: 20000,
    });
    await expect(participantListItems).toHaveCount(1);
    await expect(rightPanelTitle).toHaveText('Participants (1)');
  });

  test('should show a single right panel when switching from chat to participants and expand the layout on close', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    await openMeetingWithTwoParticipants({ pageOne, context, browserName });

    const videoWrapper = pageOne.locator('#wrapper');
    const closedPanelWidth = await getElementWidth(videoWrapper);

    await openRightPanelTab({ page: pageOne, buttonTestId: 'chat-button' });

    const rightPanel = pageOne.getByTestId('right-panel');
    const rightPanelTitle = pageOne.getByTestId('right-panel-title');
    const chatInput = pageOne.getByPlaceholder('Send a message');
    await expect(rightPanel).toBeVisible();
    await expect(rightPanelTitle).toHaveText('Chat');
    await expect(chatInput).toBeVisible();
    await expect.poll(() => getElementWidth(videoWrapper)).toBeLessThan(closedPanelWidth);

    await openRightPanelTab({ page: pageOne, buttonTestId: 'participant-list-button' });

    await expect(rightPanelTitle).toHaveCount(1);
    await expect(rightPanelTitle).toHaveText('Participants (2)');
    await expect(chatInput).toHaveCount(0);
    await expect(pageOne.getByPlaceholder('Search participants')).toBeVisible();

    await rightPanelTitle.getByTestId('CloseIcon').click();

    await expect(rightPanel).toBeHidden();
    await expect(rightPanelTitle).toHaveCount(0);
    await expect.poll(() => getElementWidth(videoWrapper)).toBe(closedPanelWidth);
  });

  test('should navigate the leaving participant to the goodbye page and re-lay out the remaining tiles', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context, browserName });

    const publisher = pageOne.locator('.publisher');
    const publisherWidthWithSubscriber = await getElementWidth(publisher);

    const exitButton = pageTwo.getByTestId('CallEndIcon');
    await expect(exitButton).toBeEnabled();
    await exitButton.click();

    await expect(pageTwo).toHaveURL(/goodbye/);
    await expect(pageTwo.getByTestId('header-message')).toHaveText('You have left the meeting');
    await expect(pageTwo.getByRole('button', { name: 'Go back to meeting' })).toBeVisible();

    await expect(pageOne.locator('.subscriber')).toHaveCount(0, { timeout: 20000 });
    await expect(pageOne.getByText('User Two', { exact: true })).toHaveCount(0);
    await expect
      .poll(() => getElementWidth(publisher))
      .toBeGreaterThan(publisherWidthWithSubscriber);
  });
});

async function openMeetingWithTwoParticipants({
  pageOne,
  context,
  browserName,
}: {
  pageOne: Page;
  context: BrowserContext;
  browserName: string;
}): Promise<{ pageTwo: Page }> {
  const roomName = crypto.randomBytes(5).toString('hex');

  await openMeetingRoomWithSettings({ page: pageOne, username: 'User One', roomName, browserName });
  await pageOne.waitForSelector('.publisher', { state: 'visible' });

  const pageTwo = await context.newPage();
  await openMeetingRoomWithSettings({ page: pageTwo, username: 'User Two', roomName, browserName });
  await pageTwo.waitForSelector('.publisher', { state: 'visible' });

  await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
    timeout: 20000,
  });
  await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
    timeout: 20000,
  });

  return { pageTwo };
}

async function openRightPanelTab({
  page,
  buttonTestId,
}: {
  page: Page;
  buttonTestId: 'chat-button' | 'participant-list-button';
}): Promise<void> {
  const visibleButton = page.locator(`[data-testid="${buttonTestId}"]:visible`);

  const isButtonInToolbar = (await visibleButton.count()) > 0;
  if (!isButtonInToolbar) {
    await page.getByTestId('hidden-toolbar-items').click();
  }

  await visibleButton.first().click();
  await page.mouse.move(0, 0);
}

async function getElementWidth(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  return box?.width ?? 0;
}
