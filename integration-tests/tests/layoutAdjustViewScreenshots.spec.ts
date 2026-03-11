import { expect, type Page } from '@playwright/test';
import { randomBytes } from 'crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { test } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings, waitUntilReady, TIMEOUTS, VIEWPORT } from './utils';

const MASK_SELECTORS = ['.video__element'];
const OUTPUT_DIR = path.resolve(__dirname, '../../tests-out/layout-screenshots');
type ScreenshotOptions = Parameters<Page['screenshot']>[0];

const capture = async ({
  name,
  page,
  options,
}: {
  name: string;
  page: Page;
  options?: ScreenshotOptions;
}) => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, name),
    mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
    fullPage: true,
    timeout: TIMEOUTS.DEFAULT,
    ...options,
  });
};

test.describe('Adjust view screenshots (manual)', () => {
  test.skip(({ project }) => project.name !== 'Google Chrome Fake Devices');
  test.skip(() => process.platform !== 'darwin');

  test.beforeEach(async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
    }
    await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  });

  test('layout button closed', async ({ page, browserName }) => {
    const roomName = `layout-${randomBytes(4).toString('hex')}`;
    await openMeetingRoomWithSettings({
      page,
      roomName,
      username: 'Layout Screenshot',
      audioOff: true,
      videoOff: true,
      browserName,
    });
    await waitUntilReady(page, browserName);

    const chevron = page.getByTestId('layout-menu-trigger');
    await expect(chevron).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    await page.waitForTimeout(500);

    await capture({ name: 'layout-button-closed.png', page });
  });

  test('layout panel open', async ({ page, browserName }) => {
    const roomName = `layout-${randomBytes(4).toString('hex')}`;
    await openMeetingRoomWithSettings({
      page,
      roomName,
      username: 'Layout Screenshot',
      audioOff: true,
      videoOff: true,
      browserName,
    });
    await waitUntilReady(page, browserName);

    await page.getByTestId('layout-menu-trigger').click();
    await expect(page.getByText('Adjust view')).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    await page.waitForTimeout(500);

    await capture({ name: 'layout-panel-open.png', page });
  });
});
