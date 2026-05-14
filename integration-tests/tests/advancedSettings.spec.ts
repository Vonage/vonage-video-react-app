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

  await page.getByText('Settings', { exact: true }).click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();

  await page.getByRole('button', { name: 'Video' }).click();

  const resolutionSelect = page
    .getByRole('heading', { name: 'Resolution' })
    .locator('xpath=..')
    .getByRole('combobox');

  await resolutionSelect.selectOption('640x480');
  await expect(resolutionSelect).toHaveValue('640x480');

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByTestId('advanced-settings-dialog')).toBeHidden();

  await getMoreOptionsButton(page).click();
  await page.getByText('Settings', { exact: true }).click();

  await expect(page.getByTestId('advanced-settings-dialog')).toBeVisible();
  await expect(resolutionSelect).toHaveValue('640x480');
});

function getMoreOptionsButton(page) {
  return page.locator('button').filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') });
}
