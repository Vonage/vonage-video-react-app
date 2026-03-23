import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';
import { TIMEOUTS, VIEWPORT, SCREENSHOT } from './utils';

test('Landing page UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }

  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // Let page settle for screenshot
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});

test('Waiting page UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }

  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(`${baseURL}waiting-room/test-room`);
  await page.waitForLoadState('networkidle');
  await page
    .waitForSelector('.video__element', { state: 'attached', timeout: TIMEOUTS.DEFAULT })
    .catch(() => {});
  await page.waitForTimeout(500); // Let page settle for screenshot
  await expect(page).toHaveScreenshot({
    mask: [page.locator('.video__element'), page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});

test('Unsupported browser page UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }

  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(`${baseURL}unsupported-browser`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // Let page settle for screenshot
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});
