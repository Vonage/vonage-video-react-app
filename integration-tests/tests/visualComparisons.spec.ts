import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
  await page.goto(`${baseURL}waiting-room/test-room`);
  await page.waitForTimeout(1000);
});

test('Landing page UI test', async ({ page }) => {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await expect(page).toHaveScreenshot({ maxDiffPixels: 800, timeout: 10000 });
});

test('Waiting page UI test', async ({ page }) => {
  await page.waitForLoadState('networkidle');
  await page
    .waitForSelector('.video__element', { state: 'attached', timeout: 5000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  await expect(page).toHaveScreenshot({
    mask: [page.locator('.video__element')],
    maxDiffPixels: 800,
    timeout: 10000,
  });
});

test('Unsupported browser page UI test', async ({ page }) => {
  await page.goto(`${baseURL}unsupported-browser`, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await expect(page).toHaveScreenshot({ maxDiffPixels: 800, timeout: 10000 });
});
