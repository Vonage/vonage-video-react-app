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

test('Landing page dark UI test', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
  }
  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  // Playwright 1.46 Firefox drops colorScheme emulation when it navigates to the app origin.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="app-version"]')],
    maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
    timeout: TIMEOUTS.DEFAULT,
  });
});
for (const colorScheme of ['light', 'dark'] as const) {
  test(`Landing page invalid room id ${colorScheme} UI test`, async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
    }
    await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    // Playwright 1.46 Firefox drops colorScheme emulation when it navigates to the app origin.
    await page.emulateMedia({ colorScheme });
    await page.waitForFunction(
      (isDark) => document.documentElement.classList.contains('dark') === isDark,
      colorScheme === 'dark'
    );
    await page.getByRole('textbox', { name: /Room ID/i }).fill('not a room!');
    await page.getByRole('button', { name: 'Join waiting room' }).click();
    await expect(page.getByText('Enter a valid room ID')).toBeVisible();
    await expect(page).toHaveScreenshot({
      mask: [page.locator('[data-testid="app-version"]')],
      maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
      timeout: TIMEOUTS.DEFAULT,
    });
  });
}
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
