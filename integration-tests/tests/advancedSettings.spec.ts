import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(`${baseURL}waiting-room/test-room`);
  await page.waitForTimeout(1000);
});

test('should keep the selected resolution after reopening settings in the waiting room', async ({
  page,
}) => {
  await getMoreOptionsButton(page).click();
  await expect(page.getByTestId('menu-more-options')).toBeVisible();

  const advancedSettingsOption = page.getByTestId('advanced-settings-option');

  if ((await advancedSettingsOption.count()) === 0) {
    return;
  }

  await advancedSettingsOption.click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();

  await page.getByRole('button', { name: 'Video' }).click();

  const resolutionSelect = page.getByLabel('Resolution');

  await resolutionSelect.selectOption('640x480');
  await expect(resolutionSelect).toHaveValue('640x480');

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeHidden();

  await getMoreOptionsButton(page).click();
  await page.getByTestId('advanced-settings-option').click();

  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();
  await expect(resolutionSelect).toHaveValue('640x480');
});

test('should keep the selected audio bitrate mode after reopening settings', async ({ page }) => {
  await openAudioTab(page);

  const bitrateSelect = page.getByLabel('Audio bitrate');
  await bitrateSelect.selectOption('custom');
  await expect(bitrateSelect).toHaveValue('custom');

  await expect(page.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
  await openAudioTab(page);

  await expect(bitrateSelect).toHaveValue('custom');
  await expect(page.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeVisible();
});

test('should hide the custom bitrate slider when audio bitrate is set to automatic', async ({
  page,
}) => {
  await openAudioTab(page);

  const bitrateSelect = page.getByLabel('Audio bitrate');
  await bitrateSelect.selectOption('custom');
  await expect(page.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeVisible();

  await bitrateSelect.selectOption('automatic');
  await expect(page.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeHidden();
});

async function openAudioTab(page) {
  await getMoreOptionsButton(page).click();
  await expect(page.getByTestId('menu-more-options')).toBeVisible();

  const advancedSettingsOption = page.getByTestId('advanced-settings-option');
  if ((await advancedSettingsOption.count()) === 0) {
    return;
  }

  await advancedSettingsOption.click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Audio' }).click();
}

function getMoreOptionsButton(page) {
  return page.locator('button').filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') });
}
