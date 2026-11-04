import { devices, expect, type Locator, type Page } from '@playwright/test';
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

for (const colorScheme of ['light', 'dark'] as const) {
  test(`Create meeting dialog UI test (${colorScheme})`, async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
    }

    const dialog = await openCreateMeetingDialog({ page, colorScheme });

    await expect(page).toHaveScreenshot({
      mask: getCreateMeetingDialogMasks({ page, dialog }),
      maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
      timeout: TIMEOUTS.DEFAULT,
    });
  });

  test(`Create meeting dialog link copied UI test (${colorScheme})`, async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
    }

    const dialog = await openCreateMeetingDialog({ page, colorScheme });
    await dialog.getByRole('button', { name: 'Copy link' }).click();
    await expect(dialog.getByRole('button', { name: 'Link copied' })).toBeVisible();
    await expect(page.getByRole('tooltip', { name: 'Link copied' })).toBeVisible();
    await page.waitForTimeout(500); // Let page settle for screenshot

    await expect(page).toHaveScreenshot({
      mask: getCreateMeetingDialogMasks({ page, dialog }),
      maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
      timeout: TIMEOUTS.DEFAULT,
    });
  });

  test(`Create meeting dialog phone layout UI test (${colorScheme})`, async ({ page }) => {
    const phoneViewport = devices['Pixel 5'].viewport;
    await page.setViewportSize(phoneViewport);

    const dialog = await openCreateMeetingDialog({ page, colorScheme });

    await expect(page).toHaveScreenshot({
      mask: getCreateMeetingDialogMasks({ page, dialog }),
      maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
      timeout: TIMEOUTS.DEFAULT,
    });
  });
}

async function openCreateMeetingDialog({
  page,
  colorScheme,
}: {
  page: Page;
  colorScheme: 'light' | 'dark';
}): Promise<Locator> {
  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  // Playwright 1.46 Firefox drops colorScheme emulation when it navigates to the app origin.
  await page.emulateMedia({ colorScheme });
  await page.waitForFunction(
    (isDark) => document.documentElement.classList.contains('dark') === isDark,
    colorScheme === 'dark'
  );

  await page.getByRole('button', { name: 'Create a new room' }).click();

  const dialog = page.getByRole('dialog', { name: 'Create a meeting' });
  await expect(dialog.getByText(new RegExp(`${baseURL}waiting-room/.+`))).toBeVisible();
  await page.waitForTimeout(500); // Let page settle for screenshot

  return dialog;
}

function getCreateMeetingDialogMasks({ page, dialog }: { page: Page; dialog: Locator }) {
  return [
    page.locator('[data-testid="app-version"]'),
    dialog.getByText(new RegExp(`${baseURL}waiting-room/.+`)),
  ];
}
