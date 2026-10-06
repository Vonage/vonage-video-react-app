import { expect } from '@playwright/test';
import { test } from '../fixtures/testWithLogging';
import { APP_URL, CALLBACK_URL, LOCAL_OIDC_URL, SESSION_COOKIE_NAME } from './constants';

test('an unauthenticated deep link goes through the provider and returns to the same URL', async ({
  page,
  context,
}) => {
  const navigatedUrls: string[] = [];
  page.on('request', (request) => {
    if (request.isNavigationRequest()) navigatedUrls.push(request.url());
  });

  const deepLink = `${APP_URL}/waiting-room/e2e-auth-room`;

  await page.goto(deepLink);

  await expect(page).toHaveURL(deepLink);
  expect(navigatedUrls).toEqual(
    expect.arrayContaining([
      expect.stringContaining(`${APP_URL}/auth/signin`),
      expect.stringContaining(`${LOCAL_OIDC_URL}/authorize`),
      expect.stringContaining(CALLBACK_URL),
    ])
  );

  const cookies = await context.cookies(APP_URL);
  expect(cookies.map((cookie) => cookie.name)).toContain(SESSION_COOKIE_NAME);
});

test('a signed-in user can create a room through the authenticated API', async ({ page }) => {
  await page.goto(`${APP_URL}/`);

  await page.getByRole('button', { name: 'Create a new room' }).click();

  await expect(page).toHaveURL(new RegExp(`${APP_URL}/waiting-room/.+`));
});
