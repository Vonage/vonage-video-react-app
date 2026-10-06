import { expect } from '@playwright/test';
import { test } from '../fixtures/testWithLogging';
import { APP_URL, LOCAL_OIDC_URL, SESSION_COOKIE_NAME } from './constants';
import readCookie from './helpers/readCookie';

const PROTECTED_API_URL = `${APP_URL}/session/e2e-auth-logout-room`;

test('the banner shows a log out button when auth is enabled', async ({ page }) => {
  await page.goto(`${APP_URL}/`);

  await expect(page.getByTestId('banner-logout')).toBeVisible();
});

test('log out ends the provider session and revokes the previous session', async ({
  page,
  context,
}) => {
  await page.goto(`${APP_URL}/`);
  const previousSessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });

  const endSessionRequest = page.waitForRequest((request) =>
    request.url().startsWith(`${LOCAL_OIDC_URL}/logout`)
  );
  await page.getByTestId('banner-logout').click();
  const endSessionUrl = new URL((await endSessionRequest).url());

  expect(endSessionUrl.searchParams.get('id_token_hint')).toBeTruthy();
  expect(endSessionUrl.searchParams.get('post_logout_redirect_uri')).toEqual(`${APP_URL}/`);

  await expect(page).toHaveURL(`${APP_URL}/`);
  const newSessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });
  expect(newSessionCookie?.value).toBeDefined();
  expect(newSessionCookie?.value).not.toEqual(previousSessionCookie?.value);

  await context.addCookies([previousSessionCookie]);
  const res = await context.request.get(PROTECTED_API_URL, {
    headers: { Accept: 'application/json' },
    maxRedirects: 0,
  });

  expect(res.status()).toEqual(401);
});
