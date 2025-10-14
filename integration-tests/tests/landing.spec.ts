import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
});

test('should navigate to precall test, then waiting room, then publish in room via Enter room name textbox', async ({
  page,
}) => {
  await expect(page.locator('button:text("Join")')).toHaveAttribute('disabled', '');

  await page.getByPlaceholder('Enter room name').fill('some-room');

  await page.locator('button:text("Join")').click();

  await expect(page).toHaveURL(`${baseURL}precall/some-room`);

  // Click "Continue to Call" button to skip the network tests and go to waiting room
  await page.getByRole('button', { name: 'Continue to Call' }).click();

  await expect(page).toHaveURL(`${baseURL}waiting-room/some-room`);

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.waitForTimeout(1000);
  await page.getByPlaceholder('Enter your name').fill('some-user');
  await page.getByRole('button', { name: 'Join' }).click();

  await expect(page).toHaveURL(`${baseURL}room/some-room`);

  await page.waitForSelector('.publisher', { state: 'visible' });
});

test('should navigate to precall test, then waiting room, then publish in room via Create room button', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Create room' }).click();

  await expect(page.url()).toContain('precall/');

  // Click "Continue to Call" button to skip the network tests and go to waiting room
  await page.getByRole('button', { name: 'Continue to Call' }).click();

  await expect(page.url()).toContain('waiting-room/');

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.waitForTimeout(1000);
  await expect(page.getByRole('button', { name: 'Join' })).toHaveAttribute('disabled', '');

  await page.getByPlaceholder('Enter your name').fill('some-user');
  await page.getByRole('button', { name: 'Join' }).click();

  await expect(page.url()).toContain('room/');

  await page.waitForSelector('.publisher', { state: 'visible' });
});

test('GitHub Logo Redirect to Vera GitHub URL in New Tab', async ({ page, context }) => {
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'Visit our GitHub Repo' }).click(), // Opens a new tab
  ]);
  await newPage.waitForLoadState();
  await expect(newPage).toHaveURL('https://github.com/Vonage/vonage-video-react-app/');
});

test('PreCall test page should display correctly and allow network testing', async ({ page }) => {
  await page.getByPlaceholder('Enter room name').fill('test-room');
  await page.locator('button:text("Join")').click();

  await expect(page).toHaveURL(`${baseURL}precall/test-room`);

  // Verify PreCall test page elements are present
  await expect(page.getByText('Pre-call Network Test')).toBeVisible();
  await expect(page.getByText(/Network test for room:/)).toBeVisible();
  await expect(page.getByText('test-room')).toBeVisible();

  // Verify test buttons are present
  await expect(page.getByRole('button', { name: 'Test Connectivity' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Test Quality' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Call' })).toBeVisible();

  // Test the connectivity test
  await page.getByRole('button', { name: 'Test Connectivity' }).click();

  // Wait for test to complete (should show results or stop button)
  await page.waitForTimeout(3000);

  // Should be able to continue to waiting room
  await page.getByRole('button', { name: 'Continue to Call' }).click();
  await expect(page).toHaveURL(`${baseURL}waiting-room/test-room`);
});

test('User should be able to navigate to the next page using enter key', async ({ page }) => {
  await page.getByPlaceholder('Enter room name').fill('some-room');

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(`${baseURL}precall/some-room`);

  // Click "Continue to Call" button to skip the network tests and go to waiting room
  await page.getByRole('button', { name: 'Continue to Call' }).click();

  await expect(page).toHaveURL(`${baseURL}waiting-room/some-room`);

  // This is needed for the DeviceAccessAlert to hide
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  await page.getByPlaceholder('Enter your name').fill('some-user');

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(`${baseURL}room/some-room`);

  await page.waitForSelector('.publisher', { state: 'visible' });
});
