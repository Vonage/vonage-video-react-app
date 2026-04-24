import { expect } from '@playwright/test';
import * as crypto from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';

test('should render `Reenter` button when exiting a room and it should return user to the room', async ({
  page,
}) => {
  const roomName = crypto.randomBytes(5).toString('hex');
  const roomUrl = `room/${roomName}`;

  await page.goto(`${baseURL}${roomUrl}?bypass=true`);

  // Wait for the exit button to become enabled (session must be established first)
  const exitButton = page.getByTestId('CallEndIcon');
  await expect(exitButton).toBeEnabled();
  await exitButton.click();

  // Checking we navigated to the goodbye page
  await expect(page).toHaveURL(/goodbye/);
  const reenterButton = page.getByRole('button', { name: 'Go back to meeting' });
  await expect(reenterButton).toBeVisible();

  // Checking that you can reenter the exited room
  await reenterButton.click();
  await expect(page).toHaveURL(/waiting-room/);
});

test('should not render `Reenter` button when navigating directly to goodbye', async ({ page }) => {
  await page.goto(baseURL);
  await page.goto(`${baseURL}goodbye`);

  const reenterButton = page.getByRole('button', { name: 'Go back to meeting' });
  await expect(reenterButton).not.toBeVisible();
});

test('should render `View Landing Page` and it should navigate to the landing page', async ({
  page,
}) => {
  await page.goto(baseURL);
  await page.goto(`${baseURL}goodbye`);

  const landingPageButton = page.getByRole('button', { name: 'View Landing Page' });
  await expect(landingPageButton).toBeVisible();

  await landingPageButton.click();
  await expect(page).toHaveURL(baseURL);
  await expect(page.getByRole('button', { name: 'Create a new room' })).toBeVisible();
});
