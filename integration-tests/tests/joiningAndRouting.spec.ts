import { expect, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady } from './utils';

const INVALID_ROOM_NAME_HELPER = 'Cannot be empty, contain spaces or special characters';

test.describe('join via direct room URL', () => {
  for (const entryPath of ['room', 'waiting-room'] as const) {
    test(`should show the room name in the waiting room and join the meeting from /${entryPath}/<name>`, async ({
      page,
      browserName,
    }) => {
      const roomName = createRoomName();

      await page.goto(`${baseURL}${entryPath}/${roomName}`);
      await waitUntilReady(page, browserName);

      await expect(page).toHaveURL(`${baseURL}waiting-room/${roomName}`);
      await expect(page.getByText(roomName, { exact: true })).toBeVisible();

      await page.getByLabel('Name').fill('Direct User');
      await page.getByRole('button', { name: 'Join meeting' }).click();

      await expect(page).toHaveURL(/\/room\//);
      await expect(page.getByTestId('meetingRoom')).toBeVisible();
      await expect(page.getByTestId('publisher-container').getByText('Direct User')).toBeVisible({
        timeout: 20_000,
      });
      await expectMeetingRoomName({ page, roomName });
    });
  }
});

test.describe('room name edge cases', () => {
  test('should normalize an uppercase name with allowed symbols and put both users in the same session', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    const uniquePart = crypto.randomBytes(3).toString('hex');
    const typedRoomName = `TEAM_${uniquePart.toUpperCase()}+B-1`;
    const roomName = `team_${uniquePart}+b-1`;

    await pageOne.goto(baseURL);
    const roomNameInput = pageOne.getByRole('textbox', { name: /Room name/i });
    await roomNameInput.fill(typedRoomName);
    await expect(roomNameInput).toHaveValue(roomName);
    await pageOne.getByRole('button', { name: 'Join waiting room' }).click();

    await expect(pageOne).toHaveURL(/\/waiting-room\/[\w-]+\.[\w-]+\.[\w-]+$/);
    await waitUntilReady(pageOne, browserName);
    await expect(pageOne.getByText(roomName, { exact: true })).toBeVisible();
    await pageOne.getByLabel('Name').fill('User One');
    await pageOne.getByRole('button', { name: 'Join meeting' }).click();
    await expect(pageOne.locator('.publisher')).toBeVisible();
    await expectMeetingRoomName({ page: pageOne, roomName });

    const pageTwo = await context.newPage();
    await pageTwo.goto(`${baseURL}waiting-room/${encodeURIComponent(roomName)}`);
    await waitUntilReady(pageTwo, browserName);
    await expect(pageTwo.getByText(roomName, { exact: true })).toBeVisible();
    await pageTwo.getByLabel('Name').fill('User Two');
    await pageTwo.getByRole('button', { name: 'Join meeting' }).click();
    await expect(pageTwo.locator('.publisher')).toBeVisible();
    await expectMeetingRoomName({ page: pageTwo, roomName });

    await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
      timeout: 20_000,
    });
    await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
      timeout: 20_000,
    });
  });

  for (const invalidRoomName of ['my room', 'café', 'room!@#']) {
    test(`should reject "${invalidRoomName}" on the landing page`, async ({ page }) => {
      await page.goto(baseURL);

      const roomNameInput = page.getByRole('textbox', { name: /Room name/i });
      await roomNameInput.fill(invalidRoomName);

      await expect(page.getByText(INVALID_ROOM_NAME_HELPER)).toBeVisible();
      await expect(roomNameInput).toHaveValue('');

      await page.getByRole('button', { name: 'Join waiting room' }).click();
      await expect(page).toHaveURL(baseURL);
    });
  }
});

test.describe('duplicate user names', () => {
  test('should render both tiles and list both participants when two users share a name', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    const roomName = createRoomName();
    const sharedName = 'Sam Smith';

    await joinMeetingRoom({ page: pageOne, username: sharedName, roomName, browserName });
    const pageTwo = await context.newPage();
    await joinMeetingRoom({ page: pageTwo, username: sharedName, roomName, browserName });

    for (const page of [pageOne, pageTwo]) {
      await expect(page.getByTestId('publisher-container').getByText(sharedName)).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.locator('.subscriber').getByText(sharedName)).toBeVisible({
        timeout: 20_000,
      });
    }

    await openParticipantList(pageOne);

    const participantListItems = pageOne.locator('[data-testid^="participant-list-item"]');
    await expect(pageOne.getByTestId('right-panel-title')).toHaveText('Participants (2)');
    await expect(participantListItems).toHaveCount(2);
    await expect(pageOne.getByTestId('participant-list-item-you')).toContainText(
      `${sharedName} (You)`
    );
    await expect(
      participantListItems.filter({ hasNotText: '(You)' }).filter({ hasText: sharedName })
    ).toHaveCount(1);
  });
});

test.describe('rejoin', () => {
  test('should keep the name and return the user to the same room from the goodbye page', async ({
    page: pageOne,
    browser,
    browserName,
  }) => {
    const roomName = createRoomName();

    await joinMeetingRoom({ page: pageOne, username: 'User One', roomName, browserName });
    const contextTwo = await browser.newContext();
    const pageTwo = await contextTwo.newPage();
    await joinMeetingRoom({ page: pageTwo, username: 'User Two', roomName, browserName });
    await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
      timeout: 20_000,
    });

    const exitButton = pageOne.getByTestId('CallEndIcon');
    await expect(exitButton).toBeEnabled();
    await exitButton.click();
    await expect(pageOne).toHaveURL(/\/goodbye\//);
    await expect(pageTwo.locator('.subscriber')).toHaveCount(0, { timeout: 20_000 });

    await pageOne.getByRole('button', { name: 'Go back to meeting' }).click();

    await expect(pageOne).toHaveURL(/\/waiting-room\//);
    await expect(pageOne.getByText(roomName, { exact: true })).toBeVisible();
    await expect(pageOne.getByLabel('Name')).toHaveValue('User One');

    await pageOne.getByRole('button', { name: 'Join meeting' }).click();

    await expect(pageOne.getByTestId('publisher-container').getByText('User One')).toBeVisible({
      timeout: 20_000,
    });
    await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
      timeout: 20_000,
    });
    await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
      timeout: 20_000,
    });

    await contextTwo.close();
  });
});

test.describe('unknown route and error page', () => {
  test('should render the landing page for an unknown path without redirecting', async ({
    page,
  }) => {
    await page.goto(`${baseURL}some/unknown/path`);

    await expect(page).toHaveURL(`${baseURL}some/unknown/path`);
    await expect(page.getByRole('button', { name: 'Create a new room' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Room name/i })).toBeVisible();
    await expect(page.getByTestId('error-page')).toHaveCount(0);
  });

  for (const { encodedRoomName, decodedRoomName } of [
    { encodedRoomName: 'my%20room', decodedRoomName: 'my room' },
    { encodedRoomName: 'caf%C3%A9', decodedRoomName: 'café' },
    { encodedRoomName: 'room!%40%23', decodedRoomName: 'room!@#' },
    { encodedRoomName: 'MyRoom', decodedRoomName: 'MyRoom' },
  ]) {
    test(`should render the error page for the invalid room URL "${decodedRoomName}"`, async ({
      page,
    }) => {
      await page.goto(`${baseURL}waiting-room/${encodedRoomName}`);

      const errorPage = page.getByTestId('error-page');
      await expect(errorPage).toBeVisible();
      await expect(errorPage.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
      await expect(errorPage.locator('pre')).toHaveText(`Invalid sessionKey: ${decodedRoomName}`);
    });
  }
});

test.describe('unsupported browser redirect', () => {
  test('should redirect room routes to the unsupported browser page when WebRTC is missing', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const browserWindow = window as unknown as Record<string, unknown>;
      delete browserWindow.RTCPeerConnection;
      delete browserWindow.webkitRTCPeerConnection;
    });

    await page.goto(`${baseURL}waiting-room/${createRoomName()}`);
    await expect(page).toHaveURL(`${baseURL}unsupported-browser`);
    await expect(page.getByText('Your browser is not compatible.')).toBeVisible();

    await page.goto(`${baseURL}room/${createRoomName()}?bypass=true`);
    await expect(page).toHaveURL(`${baseURL}unsupported-browser`);

    await page.goto(baseURL);
    await expect(page).toHaveURL(baseURL);
    await expect(page.getByRole('button', { name: 'Create a new room' })).toBeVisible();
  });
});

test.describe('reconnecting state', () => {
  test('should show the reconnecting state while offline and resume the call when back online', async ({
    page: pageOne,
    context,
    browser,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Playwright offline mode in Firefox does not drop already open WebSocket and WebRTC connections'
    );
    test.setTimeout(120_000);

    const roomName = createRoomName();
    await joinMeetingRoom({ page: pageOne, username: 'User One', roomName, browserName });

    const contextTwo = await browser.newContext();
    const pageTwo = await contextTwo.newPage();
    await joinMeetingRoom({ page: pageTwo, username: 'User Two', roomName, browserName });
    await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
      timeout: 20_000,
    });

    const reconnectingSpinner = pageOne.getByTestId('reconnecting-progress-spinner');
    const lostConnectionAlert = pageOne.getByText('Lost connection');

    await context.setOffline(true);

    await expect(reconnectingSpinner).toBeVisible({ timeout: 30_000 });
    await expect(lostConnectionAlert).toBeVisible();
    await expect(pageOne.getByText('Please verify your network connection')).toBeVisible();

    await context.setOffline(false);

    await expect(reconnectingSpinner).toHaveCount(0, { timeout: 30_000 });
    await expect(lostConnectionAlert).toHaveCount(0);
    await expect(pageOne).toHaveURL(/\/room\//);
    await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
      timeout: 20_000,
    });
    await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
      timeout: 20_000,
    });

    await contextTwo.close();
  });
});

function createRoomName(): string {
  return crypto.randomBytes(5).toString('hex');
}

async function joinMeetingRoom({
  page,
  username,
  roomName,
  browserName,
}: {
  page: Page;
  username: string;
  roomName: string;
  browserName: string;
}): Promise<void> {
  await openMeetingRoomWithSettings({ page, username, roomName, browserName });
  await expect(page.locator('.publisher')).toBeVisible();
}

async function expectMeetingRoomName({
  page,
  roomName,
}: {
  page: Page;
  roomName: string;
}): Promise<void> {
  const visibleRoomNameLabel = page
    .locator('[data-testid="time-room-name"]:visible, [data-testid="smallViewportHeader"]:visible')
    .first();
  await expect(visibleRoomNameLabel).toContainText(roomName);
}

async function openParticipantList(page: Page): Promise<void> {
  const visibleButton = page.locator('[data-testid="participant-list-button"]:visible');

  const isButtonInToolbar = (await visibleButton.count()) > 0;
  if (!isButtonInToolbar) {
    await page.getByTestId('hidden-toolbar-items').click();
  }

  await visibleButton.first().click();
  await page.mouse.move(0, 0);
}
