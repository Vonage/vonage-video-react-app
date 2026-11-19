import { expect } from '@playwright/test';
import { test } from '../fixtures/testWithLogging';
import { APP_URL } from './constants';

test('an unauthenticated room link by name goes through sign-in and then joins the room', async ({
  page,
}) => {
  const navigatedUrls: string[] = [];
  page.on('request', (request) => {
    if (request.isNavigationRequest()) navigatedUrls.push(request.url());
  });

  await page.goto(`${APP_URL}/room/e2e-auth-deep-link-room`);

  await expect(page).toHaveURL(`${APP_URL}/waiting-room/e2e-auth-deep-link-room`);
  expect(navigatedUrls).toContainEqual(expect.stringContaining(`${APP_URL}/auth/signin`));

  await page.waitForSelector('.video__element', { state: 'visible' });
  await page.getByLabel('Name').fill('e2e-auth-user');
  await page.getByRole('button', { name: 'Join meeting' }).click();

  await expect(page.locator('.publisher')).toBeVisible();
});

test('creating a room by name through the API without credentials gets a 401', async ({
  request,
}) => {
  const res = await request.post(`${APP_URL}/v2/createSession`, {
    headers: { Accept: 'application/json' },
    data: { roomName: 'e2e-auth-guessed-room' },
  });

  expect(res.status()).toEqual(401);
});
