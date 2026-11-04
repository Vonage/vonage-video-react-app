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
  test(`Landing page invalid room id ${colorScheme} UI test`, async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
    }

    await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
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
  await dialog.getByRole('button', { name: 'Create meeting' }).click();
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

test.describe('Create meeting dialog UI test', () => {
  test.use({ timezoneId: 'UTC', locale: 'en-US' });

  const dialogStates: { state: string; prepare: (wizard: Locator) => Promise<void> }[] = [
    { state: 'details unscheduled', prepare: async () => {} },
    {
      state: 'details scheduled',
      prepare: async (wizard) => {
        await wizard.getByLabel('Meeting name (optional)').fill('weekly-sync');
        await wizard.getByRole('checkbox', { name: 'Set a date and time' }).check();
      },
    },
    {
      state: 'details start in the past',
      prepare: async (wizard) => {
        await wizard.getByRole('checkbox', { name: 'Set a date and time' }).check();
        await wizard.getByLabel('Start time').fill('09:00');
        await wizard.getByLabel('Start time').blur();
      },
    },
    {
      state: 'share scheduled',
      prepare: async (wizard) => {
        await wizard.getByLabel('Meeting name (optional)').fill('weekly-sync');
        await wizard.getByRole('checkbox', { name: 'Set a date and time' }).check();
        await wizard.getByRole('button', { name: '2 hours' }).click();
        await wizard.getByRole('button', { name: 'Create meeting' }).click();
        await wizard.getByRole('button', { name: 'Copy link' }).waitFor();
      },
    },
  ];

  const colorSchemes = ['light', 'dark'] as const;

  for (const colorScheme of colorSchemes) {
    test.describe(colorScheme, () => {
      test.use({ colorScheme });

      for (const { state, prepare } of dialogStates) {
        test(state, async ({ page, isMobile }) => {
          if (!isMobile) {
            await page.setViewportSize({ width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT });
          }

          await page.clock.setFixedTime(new Date('2024-02-02T10:20:00Z'));
          await page.goto(baseURL, { waitUntil: 'networkidle' });
          // Playwright 1.46 Firefox drops colorScheme emulation when it navigates to the app origin.
          await page.emulateMedia({ colorScheme });
          await page.waitForFunction(
            (isDark) => document.documentElement.classList.contains('dark') === isDark,
            colorScheme === 'dark'
          );
          await page.getByRole('button', { name: 'Create a new room' }).click();
          const wizard = page.getByRole('dialog', { name: 'Create a meeting' });
          await prepare(wizard);
          await page.waitForTimeout(500);

          await expect(page).toHaveScreenshot({
            mask: [
              page.locator('[data-testid="app-version"]'),
              wizard.getByText(new RegExp(`${baseURL}waiting-room/`)),
            ],
            maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
            timeout: TIMEOUTS.DEFAULT,
          });
        });
      }
    });
  }
});
