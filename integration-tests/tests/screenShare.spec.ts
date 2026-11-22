// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as screenSharingButtonTestIds } from '../../frontend/src/components/ScreenSharingButton/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as participantListButtonTestIds } from '../../frontend/src/components/MeetingRoom/ParticipantListButton/testIds';
import { expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import * as crypto from 'crypto';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings } from './utils';

const SHARING_MESSAGE = 'You are sharing your screen.';

test.describe('screen share', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'screenshare tests only supported on chrome desktop'
  );

  test('should start and stop a screen share for both participants', async ({
    page: pageOne,
    context,
  }) => {
    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context });

    await pageOne.getByTestId(screenSharingButtonTestIds.button).click();

    await expect(pageOne.getByTestId('screen-publisher-container')).toContainText(SHARING_MESSAGE);
    await expect(pageTwo.locator('.screen-subscriber')).toHaveCount(1, { timeout: 20_000 });
    await expect(pageTwo.locator('.screen-subscriber')).toContainText("User One's screen");

    await pageOne.getByTestId(screenSharingButtonTestIds.button).click();

    await expect(pageOne.getByTestId('screen-publisher-container')).toHaveCount(0);
    await expect(pageTwo.locator('.screen-subscriber')).toHaveCount(0, { timeout: 20_000 });
  });

  test('should let a second sharer cancel or replace the current screen share', async ({
    page: pageOne,
    context,
  }) => {
    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context });

    await pageOne.getByTestId(screenSharingButtonTestIds.button).click();
    await expect(pageOne.getByTestId('screen-publisher-container')).toContainText(SHARING_MESSAGE);
    await expect(pageTwo.locator('.screen-subscriber')).toHaveCount(1, { timeout: 20_000 });

    const replaceDialog = pageTwo.getByRole('dialog');
    await pageTwo.getByTestId(screenSharingButtonTestIds.button).click();
    await expect(replaceDialog).toContainText('Do you want to share your screen?');
    await expect(replaceDialog).toContainText(
      'Looks like there is someone else sharing their screen. If you continue, their screen is no longer going to be shared.'
    );

    await replaceDialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(replaceDialog).toBeHidden();
    await expect(pageTwo.getByTestId('screen-publisher-container')).toHaveCount(0);
    await expect(pageOne.getByTestId('screen-publisher-container')).toContainText(SHARING_MESSAGE);
    await expect(pageTwo.locator('.screen-subscriber')).toContainText("User One's screen");

    await pageTwo.getByTestId(screenSharingButtonTestIds.button).click();
    await replaceDialog.getByRole('button', { name: 'Start sharing your screen' }).click();

    await expect(pageTwo.getByTestId('screen-publisher-container')).toContainText(SHARING_MESSAGE);
    await expect(pageOne.getByTestId('screen-publisher-container')).toHaveCount(0, {
      timeout: 20_000,
    });
    await expect(pageOne.locator('.screen-subscriber')).toHaveCount(1, { timeout: 20_000 });
    await expect(pageOne.locator('.screen-subscriber')).toContainText("User Two's screen");
    await expect(pageTwo.locator('.screen-subscriber')).toHaveCount(0, { timeout: 20_000 });
  });

  test('should keep the screen share as the large tile when a camera tile is pinned', async ({
    page: pageOne,
    context,
  }) => {
    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context });

    await pageOne.getByTestId(screenSharingButtonTestIds.button).click();

    const screenTile = pageTwo.locator('.screen-subscriber');
    const userOneCameraTile = pageTwo.locator('.subscriber').filter({ hasText: 'User One' });
    await expect(screenTile).toHaveCount(1, { timeout: 20_000 });

    await screenTile.hover();
    await expect(screenTile.getByTestId('zoom-indicator-button')).toBeVisible();
    await expect(screenTile.getByTestId('pin-button')).toHaveCount(0);
    await expect
      .poll(async () => (await getArea(screenTile)) / (await getArea(userOneCameraTile)))
      .toBeGreaterThan(1);

    await userOneCameraTile.hover();
    await userOneCameraTile.getByTestId('pin-button').getByRole('button').click();
    await pageTwo.mouse.move(0, 0);

    await expect(userOneCameraTile.getByTestId('pin-button')).toBeVisible();

    await pageTwo.getByTestId(participantListButtonTestIds.button).click();
    await expect(
      pageTwo
        .locator('[data-testid^="participant-list-item"]', { hasText: 'User One' })
        .getByTestId('MoreVertIcon')
    ).toBeVisible();
    await pageTwo
      .locator('[data-testid^="participant-list-item"]', { hasText: 'User One' })
      .getByTestId('MoreVertIcon')
      .click();
    await expect(pageTwo.getByTestId('pin-menu-item')).toContainText('Unpin User One');
    await pageTwo.keyboard.press('Escape');
    await pageTwo.getByTestId('right-panel-title').getByTestId('CloseIcon').click();

    await expect
      .poll(async () => (await getArea(screenTile)) / (await getArea(userOneCameraTile)))
      .toBeGreaterThan(2);
  });
});

async function openMeetingWithTwoParticipants({
  pageOne,
  context,
}: {
  pageOne: Page;
  context: BrowserContext;
}): Promise<{ pageTwo: Page }> {
  const roomName = crypto.randomBytes(5).toString('hex');

  await openMeetingRoomWithSettings({ page: pageOne, username: 'User One', roomName });
  await expect(pageOne.locator('.publisher')).toBeVisible();

  const pageTwo = await context.newPage();
  await openMeetingRoomWithSettings({ page: pageTwo, username: 'User Two', roomName });
  await expect(pageTwo.locator('.publisher')).toBeVisible();

  await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
    timeout: 20_000,
  });
  await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
    timeout: 20_000,
  });

  return { pageTwo };
}

async function getArea(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Tile is not rendered, so its area cannot be measured');
  return box.width * box.height;
}
